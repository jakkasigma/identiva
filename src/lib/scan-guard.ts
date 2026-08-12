import { prisma } from "@/lib/prisma";
import { parseScanMethods, type ScanMethod } from "@/lib/scan-methods";

export async function validateScanMethod(cabangId: number, method: ScanMethod) {
  const cabang = await prisma.cabang.findUnique({
    where: { id: cabangId },
    select: {
      metodeScanAktif: true,
      mitra: { select: { metodeScanDiizinkan: true } },
    },
  });

  if (!cabang) return { allowed: false, error: "Cabang tidak ditemukan" };

  const allowedMethods = parseScanMethods(cabang.mitra.metodeScanDiizinkan);
  if (!allowedMethods.includes(method)) {
    return { allowed: false, error: "Mitra tidak diizinkan menggunakan metode scan ini" };
  }

  if (cabang.metodeScanAktif !== method) {
    return { allowed: false, error: `Cabang ini menggunakan metode ${cabang.metodeScanAktif}` };
  }

  return { allowed: true };
}
