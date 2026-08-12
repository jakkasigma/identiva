import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCabangByToken, unauthorized } from "@/lib/auth-api";
import { getCurrentPeriode } from "@/lib/quota";

const schema = z.object({
  token: z.string().min(1),
  uid: z.string().min(1),
  program_id: z.number().int().positive(),
  keterangan: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    const cabang = await getCabangByToken(body.token);
    if (!cabang) return unauthorized();
    const mitra = cabang.mitra;

    const program = await prisma.programLokaID.findFirst({
      where: { id: body.program_id, mitraId: mitra.id, status: "aktif", tujuan: "peminjaman" },
    });
    if (!program) return Response.json({ status: "error", alasan: "program_tidak_ada" }, { status: 404 });

    const penduduk = await prisma.penduduk.findUnique({ where: { uidKartu: body.uid } });
    if (!penduduk) return Response.json({ status: "invalid", alasan: "tidak_terdaftar" });

    const peserta = await prisma.pesertaLokaID.findUnique({
      where: { pendudukId_programId: { pendudukId: penduduk.id, programId: program.id } },
    });
    if (!peserta || peserta.status !== "aktif") return Response.json({ status: "invalid", alasan: "bukan_peserta" });

    const periode = getCurrentPeriode(program.periodeReset);

    await prisma.$transaction([
      prisma.aktivitasLokaID.create({
        data: { pesertaId: peserta.id, programId: program.id, mitraId: mitra.id, cabangId: cabang.id, jenis: "pengembalian", keterangan: body.keterangan ?? null },
      }),
      prisma.statusPesertaLokaID.upsert({
        where: { pesertaId_programId_periode: { pesertaId: peserta.id, programId: program.id, periode } },
        update: { status: "dikembalikan" },
        create: { pesertaId: peserta.id, programId: program.id, status: "dikembalikan", periode },
      }),
    ]);

    return Response.json({ status: "ok", nama: penduduk.nama, program: program.nama });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ status: "error", pesan: "Payload tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ status: "error", pesan: "Server error" }, { status: 500 });
  }
}
