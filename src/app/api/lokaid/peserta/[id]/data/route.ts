import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  values: z.record(z.string(), z.string().nullable()), // { kode: nilai }
  dependentId: z.coerce.number().int().positive().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const pesertaId = Number(id);
    if (isNaN(pesertaId)) return Response.json({ error: "ID tidak valid" }, { status: 400 });

    // Pastikan peserta milik mitra ini
    const peserta = await prisma.pesertaLokaID.findFirst({
      where: { id: pesertaId, program: { mitraId: session.user.mitraId } },
      include: { program: { include: { fields: true } } },
    });
    if (!peserta) return Response.json({ error: "Peserta tidak ditemukan" }, { status: 404 });

    const body = schema.parse(await request.json());
    const fields = peserta.program.fields;

    if (body.dependentId) {
      const dependent = await prisma.dependentLokaID.findFirst({
        where: { id: body.dependentId, waliId: pesertaId },
        select: { id: true },
      });
      if (!dependent) return Response.json({ error: "Data anak tidak ditemukan" }, { status: 404 });
    }

    // Validasi field wajib
    const fieldWajib = fields.filter((f) => f.wajib);
    for (const f of fieldWajib) {
      const val = body.values[f.kode];
      if (!val || val.trim() === "") {
        return Response.json({ error: `Field "${f.nama}" wajib diisi.` }, { status: 400 });
      }
    }

    // Upsert semua nilai
    for (const f of fields) {
      const nilai = body.values[f.kode] ?? null;
      if (nilai === null) continue; // skip field yang tidak dikirim
      const existing = await prisma.pesertaFieldValueLokaID.findFirst({
        where: { pesertaId, fieldId: f.id, dependentId: body.dependentId ?? null },
        select: { id: true },
      });

      if (existing) {
        await prisma.pesertaFieldValueLokaID.update({
          where: { id: existing.id },
          data: { nilai, updatedAt: new Date() },
        });
      } else {
        await prisma.pesertaFieldValueLokaID.create({
          data: { pesertaId, fieldId: f.id, dependentId: body.dependentId ?? null, nilai, updatedAt: new Date() },
        });
      }
    }

    // Log aktivitas pendataan
    await prisma.aktivitasLokaID.create({
      data: {
        pesertaId,
        programId: peserta.programId,
        mitraId: session.user.mitraId,
        dependentId: body.dependentId ?? null,
        jenis: "pendataan",
        keterangan: "Data diisi via dashboard",
      },
    });

    return Response.json({ status: "ok" });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pesertaId = Number(id);
  if (isNaN(pesertaId)) return Response.json({ error: "ID tidak valid" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const dependentIdParam = searchParams.get("dependent_id");
  const dependentId = dependentIdParam ? Number(dependentIdParam) : null;
  if (dependentIdParam && isNaN(dependentId!)) return Response.json({ error: "ID anak tidak valid" }, { status: 400 });

  const peserta = await prisma.pesertaLokaID.findFirst({
    where: { id: pesertaId, program: { mitraId: session.user.mitraId } },
    include: {
      fieldValues: { include: { field: true } },
      program: { include: { fields: { orderBy: { urutan: "asc" } } } },
    },
  });
  if (!peserta) return Response.json({ error: "Peserta tidak ditemukan" }, { status: 404 });

  if (dependentId) {
    const dependent = await prisma.dependentLokaID.findFirst({
      where: { id: dependentId, waliId: pesertaId },
      select: { id: true },
    });
    if (!dependent) return Response.json({ error: "Data anak tidak ditemukan" }, { status: 404 });
  }

  // Gabungkan definisi field + nilai yang sudah ada
  const data = peserta.program.fields.map((f) => {
    const val = peserta.fieldValues.find((v) => v.fieldId === f.id && (v.dependentId ?? null) === dependentId);
    return {
      fieldId: f.id,
      nama: f.nama,
      kode: f.kode,
      tipe: f.tipe,
      wajib: f.wajib,
      opsi: f.opsi ? JSON.parse(f.opsi) as string[] : null,
      nilai: val?.nilai ?? null,
    };
  });

  return Response.json({ data });
}
