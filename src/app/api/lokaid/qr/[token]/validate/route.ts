import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const qr = await prisma.qRToken.findUnique({
    where: { token },
    include: {
      program: { select: { id: true, nama: true, deskripsi: true, tujuan: true, status: true } },
      cabang: { select: { id: true, nama: true, kode: true, metodeScanAktif: true } },
    },
  });
  if (!qr || qr.expiresAt < new Date()) return Response.json({ error: "Token QR tidak valid atau kedaluwarsa" }, { status: 404 });
  if (qr.program.status !== "aktif") return Response.json({ error: "Program tidak aktif" }, { status: 403 });

  return Response.json({
    status: "ok",
    program: qr.program,
    cabang: qr.cabang,
    expires_at: qr.expiresAt,
  });
}
