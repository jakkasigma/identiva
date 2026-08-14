import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // Get program IDs
  const programs = await p.programLokaID.findMany({
    where: { mitra: { tipeMitra: "lokaid" } },
    select: { id: true, nama: true, tujuan: true, cabangId: true },
    orderBy: { id: "asc" },
  });

  // Get peserta with status
  const peserta = await p.pesertaLokaID.findMany({
    where: { program: { mitra: { tipeMitra: "lokaid" } } },
    select: { id: true, pendudukId: true, programId: true, status: true, penduduk: { select: { nama: true, uidKartu: true } } },
    orderBy: { id: "asc" },
  });

  // Get status per period
  const statuses = await p.statusPesertaLokaID.findMany({
    select: { pesertaId: true, programId: true, status: true, periode: true },
    orderBy: { id: "asc" },
  });

  // Get QR tokens
  const qr = await p.qRToken.findMany({ select: { token: true, programId: true, cabangId: true } });

  console.log("=== PROGRAMS ===");
  for (const pr of programs) console.log(`  id=${pr.id} nama="${pr.nama}" tujuan=${pr.tujuan} cabangId=${pr.cabangId}`);

  console.log("\n=== PESERTA (sample) ===");
  for (const ps of peserta.slice(0, 8)) console.log(`  id=${ps.id} penduduk="${ps.penduduk.nama}" uid=${ps.penduduk.uidKartu} programId=${ps.programId} status=${ps.status}`);
  console.log(`  ... total ${peserta.length}`);

  console.log("\n=== STATUS PERIODE ===");
  for (const s of statuses) console.log(`  pesertaId=${s.pesertaId} programId=${s.programId} status=${s.status} periode=${s.periode}`);

  console.log("\n=== QR TOKENS ===");
  if (qr.length === 0) console.log("  (none)");
  for (const q of qr) console.log(`  token=${q.token} programId=${q.programId} cabangId=${q.cabangId}`);

  await p.$disconnect();
}
main();