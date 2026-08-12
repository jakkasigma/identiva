import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateScanMethod } from "@/lib/scan-guard";

const schema = z.object({
  uid: z.string().min(4),
  penduduk_id: z.coerce.number().int().positive().optional(),
  nik: z.string().regex(/^\d{16}$/).optional(),
  nama: z.string().min(2).optional(),
  alamat: z.string().min(5).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = schema.parse(await request.json());

    const qr = await prisma.qRToken.findUnique({ where: { token }, include: { program: true } });
    if (!qr || qr.expiresAt < new Date()) return Response.json({ error: "Token QR tidak valid atau kedaluwarsa" }, { status: 404 });
    if (qr.program.status !== "aktif") return Response.json({ error: "Program tidak aktif" }, { status: 403 });

    const guard = await validateScanMethod(qr.cabangId, "hp_nfc");
    if (!guard.allowed) return Response.json({ error: guard.error }, { status: 403 });

    const result = await prisma.$transaction(async (tx) => {
      let penduduk;
      if (body.penduduk_id) {
        penduduk = await tx.penduduk.findUnique({ where: { id: body.penduduk_id } });
        if (!penduduk) throw new Error("Penduduk tidak ditemukan.");
      } else {
        const byUid = await tx.penduduk.findUnique({ where: { uidKartu: body.uid } });
        if (byUid) {
          penduduk = byUid;
        } else {
          if (!body.nik || !body.nama || !body.alamat) throw new Error("Data KTP lengkap dibutuhkan.");
          const byNik = await tx.penduduk.findUnique({ where: { nik: body.nik } });
          if (byNik && byNik.uidKartu !== body.uid) throw new Error("NIK dan UID tidak cocok dengan data Identiva.");
          penduduk = byNik ?? await tx.penduduk.create({
            data: { nik: body.nik, nama: body.nama, alamat: body.alamat, uidKartu: body.uid },
          });
        }
      }

      const existing = await tx.pesertaLokaID.findUnique({
        where: { pendudukId_programId: { pendudukId: penduduk.id, programId: qr.programId } },
      });
      if (existing) throw new Error("Peserta sudah terdaftar di program ini.");

      const peserta = await tx.pesertaLokaID.create({
        data: { pendudukId: penduduk.id, programId: qr.programId, cabangId: qr.cabangId },
      });
      await tx.qRToken.update({ where: { id: qr.id }, data: { usageCount: { increment: 1 } } });
      return peserta;
    });

    return Response.json({ status: "ok", peserta_id: result.id });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    if (error instanceof Error && (error.message.includes("sudah terdaftar") || error.message.includes("tidak cocok") || error.message.includes("dibutuhkan") || error.message.includes("tidak ditemukan"))) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: "Gagal mendaftarkan peserta" }, { status: 500 });
  }
}
