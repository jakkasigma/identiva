import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  wali_id:       z.number().int().positive(),
  nama:          z.string().min(2),
  tanggal_lahir: z.string().optional().nullable(),
  jenis_kelamin: z.enum(["L", "P"]).optional().nullable(),
  keterangan:    z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = createSchema.parse(await request.json());

    // Pastikan wali (peserta) milik mitra ini
    const wali = await prisma.pesertaLokaID.findFirst({
      where: { id: body.wali_id, program: { mitraId: session.user.mitraId } },
    });
    if (!wali) return Response.json({ error: "Wali tidak ditemukan" }, { status: 404 });

    const dependent = await prisma.dependentLokaID.create({
      data: {
        waliId:       body.wali_id,
        nama:         body.nama,
        tanggalLahir: body.tanggal_lahir ? new Date(body.tanggal_lahir) : null,
        jenisKelamin: body.jenis_kelamin ?? null,
        keterangan:   body.keterangan ?? null,
      },
    });

    return Response.json({ status: "ok", dependent });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal menyimpan dependent" }, { status: 500 });
  }
}
