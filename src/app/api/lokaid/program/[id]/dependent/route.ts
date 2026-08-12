import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const programId = Number(id);
  if (isNaN(programId)) return Response.json({ error: "ID tidak valid" }, { status: 400 });

  const program = await prisma.programLokaID.findFirst({
    where: { id: programId, mitraId: session.user.mitraId },
  });
  if (!program) return Response.json({ error: "Program tidak ditemukan" }, { status: 404 });

  // Ambil semua wali + anak mereka
  const peserta = await prisma.pesertaLokaID.findMany({
    where: { programId },
    include: {
      penduduk: true,
      dependents: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = peserta.map((p) => ({
    pesertaId: p.id,
    nik: p.penduduk.nik,
    namaWali: p.penduduk.nama,
    status: p.status,
    anak: p.dependents.map((d) => ({
      id: d.id,
      nama: d.nama,
      tanggalLahir: d.tanggalLahir,
      jenisKelamin: d.jenisKelamin,
    })),
  }));

  return Response.json({ wali: result });
}
