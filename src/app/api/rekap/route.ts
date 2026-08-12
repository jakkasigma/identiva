import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTanggal, generateCSV, getDateRange } from "@/lib/format";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;
  const metode = searchParams.get("metode") ?? undefined;
  const format = searchParams.get("format");
  const cabangIdParam = searchParams.get("cabang_id");
  const { start, end } = getDateRange(date);

  // admin_cabang hanya bisa lihat cabangnya sendiri
  const cabangId =
    session.user.role === "admin_cabang"
      ? session.user.cabangId ?? undefined
      : cabangIdParam
        ? Number(cabangIdParam)
        : undefined;

  const transaksi = await prisma.transaksi.findMany({
    where: {
      mitraId: session.user.mitraId,
      waktu: { gte: start, lt: end },
      metodeBayar: metode === "cash" || metode === "qris" ? metode : undefined,
      cabangId: cabangId ?? undefined,
    },
    include: {
      warga: { include: { penduduk: true } },
      programSubsidi: true,
      cabang: true,
    },
    orderBy: { waktu: "desc" },
  });

  const rows = transaksi.map((item) => ({
    waktu: formatTanggal(item.waktu),
    cabang: item.cabang.nama,
    nik: item.warga.penduduk.nik,
    nama: item.warga.penduduk.nama,
    program: item.programSubsidi.nama,
    nominal: item.nominal,
    diskon_persen: item.diskon,
    diskon_rupiah: item.diskonRupiah,
    total_bayar: item.totalBayar,
    metode: item.metodeBayar,
  }));

  if (format === "csv") {
    const csv = `\uFEFF${generateCSV(rows)}`;
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rekap-identiva.csv"`,
      },
    });
  }

  const summary = transaksi.reduce(
    (acc, item) => {
      acc.count += 1;
      acc.totalNominal += item.nominal;
      acc.totalDiskon += item.diskonRupiah;
      acc.totalDiterima += item.totalBayar;
      if (item.metodeBayar === "cash") acc.cash += item.totalBayar;
      if (item.metodeBayar === "qris") acc.qris += item.totalBayar;
      return acc;
    },
    { count: 0, totalNominal: 0, totalDiskon: 0, totalDiterima: 0, cash: 0, qris: 0 },
  );

  return Response.json({ summary, transaksi: rows });
}
