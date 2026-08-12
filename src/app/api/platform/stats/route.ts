import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") return Response.json({ error: "Forbidden" }, { status: 403 });

  const [mitra, cabang, penduduk, transaksi, pesertaLokaID, aktivitasLokaID] = await Promise.all([
    prisma.mitra.count(),
    prisma.cabang.count(),
    prisma.penduduk.count(),
    prisma.transaksi.count(),
    prisma.pesertaLokaID.count(),
    prisma.aktivitasLokaID.count(),
  ]);

  return Response.json({ stats: { mitra, cabang, penduduk, transaksi, pesertaLokaID, aktivitasLokaID } });
}
