import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z
  .object({
    penduduk_id: z.coerce.number().int().positive().optional(),
    nik: z.string().regex(/^\d{16}$/).optional(),
    nama: z.string().min(2).optional(),
    alamat: z.string().min(5).optional(),
    uid_kartu: z.string().min(4).optional(),
    program_id: z.coerce.number().int().positive(),
    scan_pending_id: z.coerce.number().int().optional(),
    anak: z
      .array(
        z.object({
          nama: z.string().min(2),
          tanggalLahir: z.string().optional(),
          jenisKelamin: z.enum(["L", "P"]).optional(),
        })
      )
      .optional(),
  })
  .refine((d) => d.penduduk_id || (d.nik && d.nama && d.alamat && d.uid_kartu), {
    message: "Kirim penduduk_id (KTP sudah ada) atau data lengkap (KTP baru)",
  });

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const programId = searchParams.get("program_id");
  const q = searchParams.get("q") ?? "";

  const peserta = await prisma.pesertaLokaID.findMany({
    where: {
      programId: programId ? Number(programId) : undefined,
      program: { mitraId: session.user.mitraId },
      OR: q ? [
        { penduduk: { nama: { contains: q } } },
        { penduduk: { nik: { contains: q } } },
      ] : undefined,
    },
    include: { penduduk: true, program: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ peserta });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = createSchema.parse(await request.json());

    // Pastikan program milik mitra ini
    const program = await prisma.programLokaID.findFirst({
      where: { id: body.program_id, mitraId: session.user.mitraId },
    });
    if (!program) return Response.json({ error: "Program tidak ditemukan" }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      let penduduk;
      if (body.penduduk_id) {
        penduduk = await tx.penduduk.findUnique({ where: { id: body.penduduk_id } });
        if (!penduduk) throw new Error("Penduduk tidak ditemukan.");
      } else {
        penduduk = await tx.penduduk.upsert({
          where: { nik: body.nik! },
          update: {},
          create: { nik: body.nik!, nama: body.nama!, alamat: body.alamat!, uidKartu: body.uid_kartu! },
        });
      }

      const existing = await tx.pesertaLokaID.findUnique({
        where: { pendudukId_programId: { pendudukId: penduduk.id, programId: program.id } },
      });
      if (existing) throw new Error("Peserta sudah terdaftar di program ini.");

      // Admin wilayah: peserta tercatat milik wilayahnya. Admin induk: program induk (cabangId null).
      const cabangId = session.user.role === "admin_cabang" ? session.user.cabangId ?? null : null;

      const peserta = await tx.pesertaLokaID.create({
        data: { pendudukId: penduduk.id, programId: program.id, cabangId },
      });

      // Buat dependent (anak) jika program sasaran anak dan data anak dikirim
      if (body.anak && body.anak.length > 0) {
        for (const anak of body.anak) {
          await tx.dependentLokaID.create({
            data: {
              waliId: peserta.id,
              nama: anak.nama,
              tanggalLahir: anak.tanggalLahir ? new Date(anak.tanggalLahir) : null,
              jenisKelamin: anak.jenisKelamin ?? null,
            },
          });
        }
      }

      if (body.scan_pending_id) {
        await tx.scanPending.deleteMany({ where: { id: body.scan_pending_id } });
      }

      return peserta;
    });

    return Response.json({ status: "ok", peserta_id: result.id });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    if (error instanceof Error && error.message.includes("sudah terdaftar")) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: "Gagal menyimpan peserta" }, { status: 500 });
  }
}
