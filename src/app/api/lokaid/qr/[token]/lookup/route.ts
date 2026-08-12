import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const qr = await prisma.qRToken.findUnique({ where: { token }, select: { programId: true, expiresAt: true } });
  if (!qr || qr.expiresAt < new Date()) return Response.json({ error: "Token QR tidak valid atau kedaluwarsa" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid")?.trim() || null;
  const nik = searchParams.get("nik")?.trim() || null;
  if (!uid && !nik) return Response.json({ error: "Butuh uid atau nik" }, { status: 400 });

  const [byUid, byNik] = await Promise.all([
    uid ? prisma.penduduk.findUnique({ where: { uidKartu: uid } }) : null,
    nik ? prisma.penduduk.findUnique({ where: { nik } }) : null,
  ]);

  let kondisi: "baru" | "ada" | "konflik" = "baru";
  let penduduk = null as typeof byUid;
  let perbedaan: string[] | null = null;
  let konflikDua: typeof byUid[] = [];

  if (byUid && byNik) {
    if (byUid.id === byNik.id) { kondisi = "ada"; penduduk = byUid; }
    else { kondisi = "konflik"; konflikDua = [byUid, byNik]; }
  } else if (byUid) {
    if (nik && byUid.nik !== nik) { kondisi = "konflik"; penduduk = byUid; perbedaan = ["nik"]; }
    else { kondisi = "ada"; penduduk = byUid; }
  } else if (byNik) {
    if (uid && byNik.uidKartu !== uid) { kondisi = "konflik"; penduduk = byNik; perbedaan = ["uid"]; }
    else { kondisi = "ada"; penduduk = byNik; }
  }

  let sudahPeserta = false;
  if (penduduk) {
    const peserta = await prisma.pesertaLokaID.findUnique({
      where: { pendudukId_programId: { pendudukId: penduduk.id, programId: qr.programId } },
      select: { id: true },
    });
    sudahPeserta = Boolean(peserta);
  }

  return Response.json({ status: "ok", kondisi, penduduk, perbedaan, konflikDua, sudahPeserta });
}
