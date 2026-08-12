import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SCAN_METHODS, parseScanMethods } from "@/lib/scan-methods";

const schema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nama: z.string().min(2),
  kode: z.string().min(3),
  alamat: z.string().optional(),
  tokenApi: z.string().min(8),
  status: z.enum(["pending", "aktif", "diblokir"]).default("aktif"),
  metodeScanAktif: z.enum(SCAN_METHODS).default("manual"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.mitraId || session.user.role !== "admin_mitra") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cabang = await prisma.cabang.findMany({
    where: { mitraId: session.user.mitraId },
    orderBy: { nama: "asc" },
    include: {
      _count: { select: { transaksi: true } },
    },
  });

  return Response.json({ cabang });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId || session.user.role !== "admin_mitra") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const mitra = await prisma.mitra.findUnique({
      where: { id: session.user.mitraId },
      select: { metodeScanDiizinkan: true },
    });
    const allowedMethods = parseScanMethods(mitra?.metodeScanDiizinkan);
    if (!allowedMethods.includes(body.metodeScanAktif)) {
      return Response.json({ error: "Metode scan tidak diizinkan untuk mitra ini" }, { status: 403 });
    }

    const data = {
      nama: body.nama,
      kode: body.kode,
      alamat: body.alamat ?? null,
      tokenApi: body.tokenApi,
      status: body.status,
      metodeScanAktif: body.metodeScanAktif,
      mitraId: session.user.mitraId,
    };

    const cabang = body.id
      ? await prisma.cabang.update({
          where: { id: body.id, mitraId: session.user.mitraId },
          data,
        })
      : await prisma.cabang.create({ data });

    return Response.json({ status: "ok", cabang });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "Gagal menyimpan cabang" }, { status: 500 });
  }
}
