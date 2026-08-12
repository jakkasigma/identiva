import { PeriodeReset } from "@prisma/client";
import { prisma } from "./prisma";

export function getCurrentPeriode(reset: PeriodeReset, date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (reset === "harian") return `${y}-${m}-${d}`;

  if (reset === "mingguan") {
    const jan1 = new Date(y, 0, 1);
    const days = Math.floor((date.getTime() - jan1.getTime()) / 86400000);
    const week = Math.ceil((days + jan1.getDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, "0")}`;
  }

  // "sekali" — periode fixed, tidak pernah reset, pakai key tetap "once"
  if (reset === "sekali") return "once";

  return `${y}-${m}`;
}

export async function ensureCurrentSaldo(
  pendudukId: number,
  mitraId: number,
  saldoDefault: number,
  periodeReset: PeriodeReset,
) {
  const periode = getCurrentPeriode(periodeReset);

  const existing = await prisma.saldo.findUnique({
    where: { pendudukId_mitraId_periode: { pendudukId, mitraId, periode } },
  });

  if (existing) return existing;

  // Baris baru untuk periode ini — baris periode lama tetap sebagai histori
  return prisma.saldo.create({
    data: { pendudukId, mitraId, saldoTotal: saldoDefault, saldoTerpakai: 0, periode },
  });
}
