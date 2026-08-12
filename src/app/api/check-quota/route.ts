import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureCurrentSaldo } from "@/lib/quota";
import { getCabangByToken, unauthorized } from "@/lib/auth-api";

const requestSchema = z.object({
  token: z.string().min(1),
  uid: z.string().min(1),
  program_id: z.number().int().positive(),
  nominal: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    // Token → Cabang → Mitra induk
    const cabang = await getCabangByToken(body.token);
    if (!cabang) return unauthorized();
    const mitra = cabang.mitra;

    // Cek program milik mitra induk
    const program = await prisma.programSubsidi.findFirst({
      where: { id: body.program_id, mitraId: mitra.id },
    });
    if (!program) {
      return Response.json({ status: "error", alasan: "program_tidak_ada" }, { status: 404 });
    }

    // Produk non-subsidi → langsung respons
    if (!program.bersubsidi) {
      return Response.json({ status: "bukan_subsidi" });
    }

    // Cari penduduk by UID
    const penduduk = await prisma.penduduk.findUnique({
      where: { uidKartu: body.uid },
    });
    if (!penduduk) {
      return Response.json({ status: "invalid", alasan: "tidak_terdaftar" });
    }

    // Cari enrollment warga aktif di mitra induk
    const warga = await prisma.warga.findUnique({
      where: { pendudukId_mitraId: { pendudukId: penduduk.id, mitraId: mitra.id } },
    });
    if (!warga || warga.status !== "aktif") {
      return Response.json({ status: "invalid", alasan: "terblokir" });
    }

    // Saldo mitra induk
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

    return Response.json({
      status: "valid",
      uid: body.uid,
      nama: penduduk.nama,
      program: program.nama,
      cabang: cabang.nama,
      nominal: body.nominal,
      diskon_persen: program.diskon,
      diskon_rupiah: diskonRupiah,
      total_bayar: body.nominal - diskonRupiah,
      sisa_saldo: sisa,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ status: "error", pesan: "Payload tidak valid", detail: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return Response.json({ status: "error", pesan: "Server error" }, { status: 500 });
  }
}
