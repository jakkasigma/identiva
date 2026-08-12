import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTanggal, generateCSV, getDateRange } from "@/lib/format";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const programFilter = searchParams.get("program");
  const jenisFilter = searchParams.get("jenis");
  const format = searchParams.get("format");
  const { start, end } = getDateRange(date);

  const aktivitas = await prisma.aktivitasLokaID.findMany({
    where: {
      mitraId: session.user.mitraId,
      waktu: { gte: start, lt: end },
      programId: programFilter && programFilter !== "semua" ? Number(programFilter) : undefined,
      jenis: jenisFilter && jenisFilter !== "semua" ? jenisFilter : undefined,
    },
    include: {
      peserta: { include: { penduduk: true } },
      program: true,
    },
    orderBy: { waktu: "desc" },
  });

  const rows = aktivitas.map((a) => ({
    waktu: formatTanggal(a.waktu),
    nik: a.peserta.penduduk.nik,
    nama: a.peserta.penduduk.nama,
    program: a.program.nama,
    jenis: a.jenis,
    keterangan: a.keterangan ?? "",
  }));

  if (format === "csv") {
    const csv = `\uFEFF${generateCSV(rows)}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aktivitas-lokaid.csv"`,
      },
    });
  }

  const summary = {
    total: aktivitas.length,
    checkin: aktivitas.filter((a) => a.jenis === "checkin").length,
    distribusi: aktivitas.filter((a) => a.jenis === "distribusi").length,
    pendataan: aktivitas.filter((a) => a.jenis === "pendataan").length,
  };

  return Response.json({ summary, aktivitas: rows });
}
