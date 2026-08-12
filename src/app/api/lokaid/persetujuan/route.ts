import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPeriode } from "@/lib/quota";

const schema = z.object({
  peserta_id: z.number().int().positive(),
  program_id: z.number().int().positive(),
  aksi: z.enum(["setujui", "tolak"]),
  keterangan: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = schema.parse(await request.json());

    const program = await prisma.programLokaID.findFirst({
      where: { id: body.program_id, mitraId: session.user.mitraId },
    });
    if (!program) return Response.json({ error: "Program tidak ditemukan" }, { status: 404 });

    const peserta = await prisma.pesertaLokaID.findFirst({
      where: { id: body.peserta_id, programId: body.program_id },
    });
    if (!peserta) return Response.json({ error: "Peserta tidak ditemukan" }, { status: 404 });

    const statusBaru = body.aksi === "setujui" ? "disetujui" : "ditolak";
    const periode = getCurrentPeriode(program.periodeReset);

    await prisma.$transaction([
      prisma.aktivitasLokaID.create({
        data: {
          pesertaId: peserta.id,
          programId: program.id,
          mitraId: session.user.mitraId,
          jenis: "persetujuan",
          keterangan: body.keterangan ?? (body.aksi === "setujui" ? "Disetujui" : "Ditolak"),
        },
      }),
      prisma.statusPesertaLokaID.upsert({
        where: { pesertaId_programId_periode: { pesertaId: peserta.id, programId: program.id, periode } },
        update: { status: statusBaru },
        create: { pesertaId: peserta.id, programId: program.id, status: statusBaru, periode },
      }),
    ]);

    return Response.json({ status: "ok", statusBaru });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal memproses persetujuan" }, { status: 500 });
  }
}
