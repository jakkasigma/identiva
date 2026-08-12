import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPeriode } from "@/lib/quota";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const programId = Number(id);
  if (isNaN(programId)) return Response.json({ error: "ID tidak valid" }, { status: 400 });

  // Pastikan program milik mitra ini
  const program = await prisma.programLokaID.findFirst({
    where: { id: programId, mitraId: session.user.mitraId },
    include: { aktivitasList: { orderBy: { urutan: "asc" } } },
  });
  if (!program) return Response.json({ error: "Program tidak ditemukan" }, { status: 404 });

  const periode = getCurrentPeriode(program.periodeReset);

  const peserta = await prisma.pesertaLokaID.findMany({
    where: { programId },
    include: {
      penduduk: true,
      statusPeserta: {
        where: { programId, periode },
        take: 1,
      },
      aktivitas: {
        where: { programId },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = peserta.map((p) => ({
    id: p.id,
    pendudukId: p.pendudukId,
    nik: p.penduduk.nik,
    nama: p.penduduk.nama,
    alamat: p.penduduk.alamat,
    uidKartu: p.penduduk.uidKartu,
    status: p.status,
    statusPeriodeIni: p.statusPeserta[0]?.status ?? null,
    totalAktivitas: p.aktivitas.length,
    createdAt: p.createdAt,
  }));

  return Response.json({ program, peserta: result, periode });
}
