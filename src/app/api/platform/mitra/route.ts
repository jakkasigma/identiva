import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") return Response.json({ error: "Forbidden" }, { status: 403 });

  const mitra = await prisma.mitra.findMany({
    include: { _count: { select: { cabang: true, warga: true, programLokaID: true, transaksi: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ mitra });
}
