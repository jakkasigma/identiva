import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  nik: z.string().regex(/^\d{16}$/),
  nama: z.string().min(2),
  alamat: z.string().min(5),
  uid_kartu: z.string().min(4),
  scan_pending_id: z.coerce.number().int().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const warga = await prisma.warga.findMany({
    where: {
      mitraId: session.user.mitraId,
      OR: q
        ? [
            { penduduk: { nama: { contains: q } } },
            { penduduk: { nik: { contains: q } } },
            { penduduk: { uidKartu: { contains: q } } },
          ]
        : undefined,
    },
    include: { penduduk: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ warga });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = createSchema.parse(await request.json());

    const result = await prisma.$transaction(async (tx) => {
      const penduduk = await tx.penduduk.upsert({
        where: { nik: body.nik },
        update: {},
        create: {
          nik: body.nik,
          nama: body.nama,
          alamat: body.alamat,
          uidKartu: body.uid_kartu,
        },
      });

      const existing = await tx.warga.findUnique({
        where: { pendudukId_mitraId: { pendudukId: penduduk.id, mitraId: session.user.mitraId! } },
      });
      if (existing) throw new Error("Warga sudah terdaftar di mitra ini.");

      const warga = await tx.warga.create({
        data: { pendudukId: penduduk.id, mitraId: session.user.mitraId! },
      });

      // Hapus scan_pending by id (scan terjadi di cabang, tidak perlu filter mitraId)
      if (body.scan_pending_id) {
        await tx.scanPending.deleteMany({ where: { id: body.scan_pending_id } });
      }

      return warga;
    });

    return Response.json({ status: "ok", warga_id: result.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("sudah terdaftar")) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: "Gagal menyimpan warga" }, { status: 500 });
  }
}
