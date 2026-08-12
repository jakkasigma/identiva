import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const schema = z.object({
  id:       z.coerce.number().int().positive().optional(),
  nama:     z.string().min(2),
  kode:     z.string().min(2),
  alamat:   z.string().optional().nullable(),
  tokenApi: z.string().min(8),
  status:   z.enum(["aktif", "diblokir"]).default("aktif"),
  // Akun operator (opsional, hanya saat buat baru)
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId || session.user.role !== "admin_mitra") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pastikan ini mitra LokaID
    const mitra = await prisma.mitra.findUnique({
      where: { id: session.user.mitraId },
      select: { tipeMitra: true },
    });
    if (mitra?.tipeMitra !== "lokaid") {
      return Response.json({ error: "Hanya untuk mitra LokaID" }, { status: 403 });
    }

    const body = schema.parse(await request.json());

    const wilayahData = {
      nama:     body.nama,
      kode:     body.kode,
      alamat:   body.alamat ?? null,
      tokenApi: body.tokenApi,
      status:   body.status,
      mitraId:  session.user.mitraId,
    };

    if (body.id) {
      // Update wilayah saja
      const wilayah = await prisma.cabang.update({
        where: { id: body.id, mitraId: session.user.mitraId },
        data: wilayahData,
      });
      return Response.json({ status: "ok", wilayah });
    }

    // Buat wilayah + akun operator dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      const wilayah = await tx.cabang.create({ data: wilayahData });

      let user = null;
      if (body.username && body.password) {
        // Cek username tidak bentrok
        const existing = await tx.user.findUnique({ where: { username: body.username } });
        if (existing) throw new Error(`Username "${body.username}" sudah dipakai.`);

        const hash = await bcrypt.hash(body.password, 10);
        user = await tx.user.create({
          data: {
            username:     body.username,
            passwordHash: hash,
            role:         "admin_cabang",
            mitraId:      session.user.mitraId,
            cabangId:     wilayah.id,
          },
        });
      }

      return { wilayah, user };
    });

    return Response.json({
      status: "ok",
      wilayah: result.wilayah,
      user: result.user ? { username: result.user.username } : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("sudah dipakai")) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: "Gagal menyimpan wilayah" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.mitraId || session.user.role !== "admin_mitra") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wilayah = await prisma.cabang.findMany({
    where: { mitraId: session.user.mitraId },
    include: {
      users: { select: { username: true, role: true } },
      programLokaID: { select: { id: true } },
      pesertaLokaID: { select: { id: true } },
    },
    orderBy: { nama: "asc" },
  });

  return Response.json({ wilayah });
}
