import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureCurrentSaldo } from "@/lib/quota";
import { getCabangByToken, unauthorized } from "@/lib/auth-api";

const requestSchema = z.object({
  token: z.string().min(1),
  uid: z.string().min(1),
  program_id: z.number().int().positive(),
  nominal: z.number().int().positive(),
  metode_bayar: z.enum(["cash", "qris"]),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    const cabang = await getCabangByToken(body.token);
    if (!cabang) return unauthorized();
    const mitra = cabang.mitra;

    const program = await prisma.programSubsidi.findFirst({
      where: { id: body.program_id, mitraId: mitra.id },
    });
    if (!program) {
      return Response.json({ status: "error", alasan: "program_tidak_ada" }, { status: 404 });
    }
    if (!program.bersubsidi) {
      return Response.json({ status: "error", alasan: "bukan_subsidi" }, { status: 400 });
    }

    const penduduk = await prisma.penduduk.findUnique({
      where: { uidKartu: body.uid },
    });
    if (!penduduk) {
      return Response.json({ status: "invalid", alasan: "tidak_terdaftar" });
    }

    const warga = await prisma.warga.findUnique({
      where: { pendudukId_mitraId: { pendudukId: penduduk.id, mitraId: mitra.id } },
    });
    if (!warga || warga.status !== "aktif") {
      return Response.json({ status: "invalid", alasan: "terblokir" });
    }

    const saldo = await ensureCurrentSaldo(
      penduduk.id,
      mitra.id,
      mitra.saldoDefault,
      program.periodeReset,
    );

    const diskonRupiah = Math.floor((body.nominal * program.diskon) / 100);
    const sisa = saldo.saldoTotal - saldo.saldoTerpakai;

    if (sisa < diskonRupiah) {
      return Response.json({ status: "invalid", alasan: "saldo_habis" });
    }

    const totalBayar = body.nominal - diskonRupiah;

    const transaksi = await prisma.$transaction(async (tx) => {
      await tx.saldo.update({
        where: { id: saldo.id },
        data: { saldoTerpakai: { increment: diskonRupiah } },
      });

      return tx.transaksi.create({
        data: {
          wargaId: warga.id,
          mitraId: mitra.id,
          cabangId: cabang.id,
          programSubsidiId: program.id,
          nominal: body.nominal,
          diskon: program.diskon,
          diskonRupiah,
          totalBayar,
          metodeBayar: body.metode_bayar,
        },
      });
    });

    return Response.json({
      status: "ok",
      transaksi_id: transaksi.id,
      total_bayar: totalBayar,
      sisa_saldo: sisa - diskonRupiah,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ status: "error", pesan: "Payload tidak valid", detail: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return Response.json({ status: "error", pesan: "Server error" }, { status: 500 });
  }
}
