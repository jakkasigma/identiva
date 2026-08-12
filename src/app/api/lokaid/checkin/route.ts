import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCabangByToken, unauthorized } from "@/lib/auth-api";
import { getCurrentPeriode } from "@/lib/quota";

const requestSchema = z.object({
  token: z.string().min(1),
  uid: z.string().min(1),
  program_id: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    const cabang = await getCabangByToken(body.token);
    if (!cabang) return unauthorized();
    const mitra = cabang.mitra;

    // Cek program milik mitra
    const program = await prisma.programLokaID.findFirst({
      where: { id: body.program_id, mitraId: mitra.id, status: "aktif" },
    });
    if (!program) {
      return Response.json({ status: "error", alasan: "program_tidak_ada" }, { status: 404 });
    }

    // Cari penduduk by UID
    const penduduk = await prisma.penduduk.findUnique({ where: { uidKartu: body.uid } });
    if (!penduduk) {
      return Response.json({ status: "invalid", alasan: "tidak_terdaftar" });
    }

    // Cari peserta aktif
    const peserta = await prisma.pesertaLokaID.findUnique({
      where: { pendudukId_programId: { pendudukId: penduduk.id, programId: program.id } },
    });
    if (!peserta || peserta.status !== "aktif") {
      return Response.json({ status: "invalid", alasan: "bukan_peserta" });
    }

    // Cek kuota per periode (jika ada)
    if (program.kuotaTotal !== null) {
      const periode = getCurrentPeriode(program.periodeReset);
      const periodeStart = getPeriodeStart(program.periodeReset);
      const count = await prisma.aktivitasLokaID.count({
        where: {
          pesertaId: peserta.id,
          programId: program.id,
          jenis: "checkin",
          waktu: { gte: periodeStart },
        },
      });
      if (count >= program.kuotaTotal) {
        return Response.json({ status: "invalid", alasan: "kuota_habis", periode });
      }
    }

    // Catat aktivitas check-in
    const aktivitas = await prisma.aktivitasLokaID.create({
      data: {
        pesertaId: peserta.id,
        programId: program.id,
        mitraId: mitra.id,
        cabangId: cabang.id,
        jenis: "checkin",
      },
    });

    // Update status peserta periode ini
    const periode = getCurrentPeriode(program.periodeReset);
    await prisma.statusPesertaLokaID.upsert({
      where: { pesertaId_programId_periode: { pesertaId: peserta.id, programId: program.id, periode } },
      update: { status: "hadir" },
      create: { pesertaId: peserta.id, programId: program.id, status: "hadir", periode },
    });

    return Response.json({
      status: "ok",
      aktivitas_id: aktivitas.id,
      nama: penduduk.nama,
      program: program.nama,
      jenis: "checkin",
      waktu: aktivitas.waktu,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ status: "error", pesan: "Payload tidak valid", detail: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return Response.json({ status: "error", pesan: "Server error" }, { status: 500 });
  }
}

function getPeriodeStart(reset: string): Date {
  const now = new Date();
  if (reset === "harian") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (reset === "mingguan") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
  if (reset === "sekali") {
    return new Date(0); // epoch — cek sejak awal waktu
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
