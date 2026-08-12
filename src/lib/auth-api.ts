import { prisma } from "./prisma";

/**
 * Resolve token IoT dari tabel Cabang.
 * Mengembalikan { cabang, mitra } agar API bisa akses mitraId induk.
 */
export async function getCabangByToken(token: string) {
  const cabang = await prisma.cabang.findUnique({
    where: { tokenApi: token },
    include: { mitra: true },
  });

  if (!cabang || cabang.status !== "aktif") return null;
  if (cabang.mitra.status !== "aktif") return null;

  return cabang; // cabang.mitra = mitra induk
}

export function unauthorized() {
  return Response.json(
    { status: "error", pesan: "Token cabang tidak valid" },
    { status: 401 },
  );
}
