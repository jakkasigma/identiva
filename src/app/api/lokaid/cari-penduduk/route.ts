import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid")?.trim() || null;
  const nik = searchParams.get("nik")?.trim() || null;
  const programId = searchParams.get("program_id");

  if (!uid && !nik) return Response.json({ error: "Butuh param uid atau nik" }, { status: 400 });

  const [byUid, byNik] = await Promise.all([
    uid ? prisma.penduduk.findUnique({ where: { uidKartu: uid } }) : null,
    nik ? prisma.penduduk.findUnique({ where: { nik } }) : null,
  ]);

  let kondisi: "baru" | "ada" | "konflik" = "baru";
  let penduduk: typeof byUid = null;
  let perbedaan: string[] | null = null;
  let konflikDua: typeof byUid[] = [];

  if (byUid && byNik) {
    if (byUid.id === byNik.id) {
      kondisi = "ada";
      penduduk = byUid;
    } else {
      kondisi = "konflik";
      konflikDua = [byUid, byNik];
    }
  } else if (byUid) {
    if (nik && byUid.nik !== nik) {
      kondisi = "konflik";
      penduduk = byUid;
      perbedaan = ["nik"];
    } else {
      kondisi = "ada";
      penduduk = byUid;
    }
  } else if (byNik) {
    if (uid && byNik.uidKartu !== uid) {
      kondisi = "konflik";
      penduduk = byNik;
      perbedaan = ["uid"];
    } else {
      kondisi = "ada";
      penduduk = byNik;
    }
  }

  let sudahPeserta: boolean | null = null;
  const pid = programId ? Number(programId) : NaN;
  if (Number.isInteger(pid) && penduduk) {
    const peserta = await prisma.pesertaLokaID.findUnique({
      where: {
        pendudukId_programId: { pendudukId: penduduk.id, programId: pid },
      },
      select: { id: true },
    });
    sudahPeserta = Boolean(peserta);
  }

  return Response.json({ status: "ok", kondisi, penduduk, perbedaan, konflikDua, sudahPeserta });
}
