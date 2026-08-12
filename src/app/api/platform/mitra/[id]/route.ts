import { z } from "zod";
import { StatusMitra } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SCAN_METHODS } from "@/lib/scan-methods";

const patchSchema = z.object({
  metode_scan_diizinkan: z.array(z.enum(SCAN_METHODS)).min(1).optional(),
  status: z.nativeEnum(StatusMitra).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const mitra = await prisma.mitra.findUnique({
    where: { id: Number(id) },
    include: {
      cabang: { orderBy: { nama: "asc" }, include: { _count: { select: { users: true, transaksi: true, programLokaID: true, pesertaLokaID: true } } } },
      _count: { select: { cabang: true, warga: true, saldo: true, transaksi: true, programSubsidi: true, programLokaID: true, aktivitasLokaID: true } },
    },
  });
  if (!mitra) return Response.json({ error: "Mitra tidak ditemukan" }, { status: 404 });

  return Response.json({ mitra });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = patchSchema.parse(await request.json());

  const mitra = await prisma.mitra.update({
    where: { id: Number(id) },
    data: {
      metodeScanDiizinkan: body.metode_scan_diizinkan,
      status: body.status,
    },
  });

  return Response.json({ status: "ok", mitra });
}
