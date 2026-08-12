import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Aktivitas default per tujuan
const defaultAktivitas: Record<string, { jenis: string; urutan: number }[]> = {
  bantuan:      [{ jenis: "verifikasi", urutan: 0 }, { jenis: "distribusi",   urutan: 1 }],
  kegiatan:     [{ jenis: "checkin",    urutan: 0 }, { jenis: "pendataan",    urutan: 1 }],
  pendataan:    [{ jenis: "pendataan",  urutan: 0 }, { jenis: "verifikasi",   urutan: 1 }],
  peminjaman:   [{ jenis: "pengajuan",  urutan: 0 }, { jenis: "persetujuan",  urutan: 1 }, { jenis: "peminjaman", urutan: 2 }, { jenis: "pengembalian", urutan: 3 }],
  pendaftaran:  [{ jenis: "pendaftaran", urutan: 0 }, { jenis: "persetujuan", urutan: 1 }, { jenis: "aktivasi",   urutan: 2 }],
};

const schema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nama: z.string().min(2),
  deskripsi: z.string().optional(),
  tujuan: z.enum(["bantuan", "kegiatan", "pendataan", "peminjaman", "pendaftaran"]),
  sasaran: z.enum(["warga", "anak"]).default("warga"),
  cabangId: z.coerce.number().int().positive().optional().nullable(),
  aktivitas: z.array(z.string()).optional(),
  fields: z.array(z.object({
    nama:   z.string().min(1),
    kode:   z.string().min(1),
    tipe:   z.enum(["text", "number", "date", "dropdown", "radio", "checkbox"]),
    wajib:  z.boolean().default(false),
    urutan: z.number().int().default(0),
    opsi:   z.array(z.string()).optional(),
  })).optional(),
  kuotaTotal: z.coerce.number().int().positive().optional().nullable(),
  periodeReset: z.enum(["harian", "mingguan", "bulanan", "sekali"]).default("bulanan"),
  perluVerifikasi: z.boolean().default(false),
  status: z.enum(["aktif", "selesai", "draft"]).default("aktif"),
  tanggalMulai: z.string().optional().nullable(),
  tanggalSelesai: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const programs = await prisma.programLokaID.findMany({
    where: { mitraId: session.user.mitraId },
    include: {
      _count: { select: { peserta: true, aktivitas: true } },
      aktivitasList: { orderBy: { urutan: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ programs });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = schema.parse(await request.json());

    const programData = {
      nama: body.nama,
      deskripsi: body.deskripsi ?? null,
      tujuan: body.tujuan,
      sasaran: body.sasaran,
      kuotaTotal: body.kuotaTotal ?? null,
      periodeReset: body.periodeReset,
      perluVerifikasi: body.perluVerifikasi,
      status: body.status,
      mitraId: session.user.mitraId,
      // Admin wilayah → otomatis pakai wilayahnya, admin induk → pakai body.cabangId atau null
      cabangId: session.user.role === "admin_cabang"
        ? (session.user.cabangId ?? null)
        : (body.cabangId ?? null),
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : null,
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
    };

    // Tentukan aktivitas yang akan disimpan
    const aktivitasInput = body.aktivitas;
    const aktivitasList = aktivitasInput && aktivitasInput.length > 0
      ? aktivitasInput.map((jenis, i) => ({ jenis, urutan: i }))
      : defaultAktivitas[body.tujuan] ?? [];

    // Siapkan field definitions
    const fieldsInput = (body.fields ?? []).map((f, i) => ({
      nama:   f.nama,
      kode:   f.kode,
      tipe:   f.tipe,
      wajib:  f.wajib,
      urutan: f.urutan ?? i,
      opsi:   f.opsi ? JSON.stringify(f.opsi) : null,
    }));

    if (body.id) {
      // Update program
      const program = await prisma.programLokaID.update({
        where: { id: body.id, mitraId: session.user.mitraId },
        data: programData,
      });

      // Sync aktivitas: hapus lama, insert baru
      await prisma.programAktivitasLokaID.deleteMany({ where: { programId: program.id } });
      await prisma.programAktivitasLokaID.createMany({
        data: aktivitasList.map((a) => ({ programId: program.id, jenis: a.jenis, urutan: a.urutan })),
      });

      // Sync fields: hanya tambah yang belum ada (jangan hapus yang sudah ada nilai-nya)
      if (fieldsInput.length > 0) {
        for (const f of fieldsInput) {
          await prisma.programFieldLokaID.upsert({
            where: { programId_kode: { programId: program.id, kode: f.kode } },
            update: { nama: f.nama, tipe: f.tipe, wajib: f.wajib, urutan: f.urutan, opsi: f.opsi },
            create: { programId: program.id, ...f },
          });
        }
      }

      return Response.json({ status: "ok", program });
    } else {
      // Create program + aktivitas + fields dalam satu transaksi
      const program = await prisma.$transaction(async (tx) => {
        const prog = await tx.programLokaID.create({ data: programData });
        await tx.programAktivitasLokaID.createMany({
          data: aktivitasList.map((a) => ({ programId: prog.id, jenis: a.jenis, urutan: a.urutan })),
        });
        if (fieldsInput.length > 0) {
          await tx.programFieldLokaID.createMany({
            data: fieldsInput.map((f) => ({ programId: prog.id, ...f })),
          });
        }
        return prog;
      });

      return Response.json({ status: "ok", program });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal menyimpan program" }, { status: 500 });
  }
}
