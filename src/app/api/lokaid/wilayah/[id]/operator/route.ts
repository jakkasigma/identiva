import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const patchSchema = z.object({
  aksi: z.enum(["reset_password", "toggle_aktif"]),
  password: z.string().min(6).optional(), // untuk reset_password
});

const postSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Helper: pastikan wilayah milik mitra LokaID ini
async function getWilayah(wilayahId: number, mitraId: number) {
  return prisma.cabang.findFirst({
    where: { id: wilayahId, mitraId },
    include: { users: { where: { role: "admin_cabang" }, select: { id: true, username: true, role: true } } },
  });
}

// PATCH — reset password atau toggle aktif operator
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId || session.user.role !== "admin_mitra") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
    if (mitra?.tipeMitra !== "lokaid") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const wilayahId = Number(id);
    const wilayah = await getWilayah(wilayahId, session.user.mitraId);
    if (!wilayah) return Response.json({ error: "Wilayah tidak ditemukan" }, { status: 404 });

    const operator = wilayah.users[0];
    if (!operator) return Response.json({ error: "Operator belum ada" }, { status: 404 });

    const body = patchSchema.parse(await request.json());

    if (body.aksi === "reset_password") {
      if (!body.password) return Response.json({ error: "Password baru diperlukan" }, { status: 400 });
      const hash = await bcrypt.hash(body.password, 10);
      await prisma.user.update({ where: { id: operator.id }, data: { passwordHash: hash } });
      return Response.json({ status: "ok", pesan: "Password berhasil direset." });
    }

    if (body.aksi === "toggle_aktif") {
      // Gunakan field role sebagai proxy — admin_cabang = aktif, kita simpan status di kolom mitraId
      // Cara lebih bersih: cek apakah user punya cabangId atau tidak
      const current = await prisma.user.findUnique({ where: { id: operator.id }, select: { cabangId: true } });
      if (current?.cabangId) {
        // Nonaktifkan: lepas cabangId
        await prisma.user.update({ where: { id: operator.id }, data: { cabangId: null } });
        return Response.json({ status: "ok", aktif: false });
      } else {
        // Aktifkan: set cabangId kembali
        await prisma.user.update({ where: { id: operator.id }, data: { cabangId: wilayahId } });
        return Response.json({ status: "ok", aktif: true });
      }
    }

    return Response.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal memproses" }, { status: 500 });
  }
}

// POST — buat akun operator baru untuk wilayah ini
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId || session.user.role !== "admin_mitra") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
    if (mitra?.tipeMitra !== "lokaid") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const wilayahId = Number(id);
    const wilayah = await getWilayah(wilayahId, session.user.mitraId);
    if (!wilayah) return Response.json({ error: "Wilayah tidak ditemukan" }, { status: 404 });

    const body = postSchema.parse(await request.json());

    // Cek username tidak bentrok
    const existing = await prisma.user.findUnique({ where: { username: body.username } });
    if (existing) return Response.json({ error: `Username "${body.username}" sudah dipakai.` }, { status: 409 });

    const hash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        username:     body.username,
        passwordHash: hash,
        role:         "admin_cabang",
        mitraId:      session.user.mitraId,
        cabangId:     wilayahId,
      },
    });

    return Response.json({ status: "ok", username: user.username });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal membuat akun" }, { status: 500 });
  }
}
