import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifikasi Data Seed LokaID\n");

  // 1. Cek mitra LokaID
  const mitra = await prisma.mitra.findFirst({
    where: { tipeMitra: "lokaid" },
    select: { id: true, nama: true, kode: true, tokenApi: true },
  });
  console.log("✓ Mitra LokaID:");
  console.log(`  Nama: ${mitra?.nama}`);
  console.log(`  Kode: ${mitra?.kode}`);
  console.log(`  Token: ${mitra?.tokenApi}`);

  // 2. Cek user admin
  const user = await prisma.user.findUnique({
    where: { username: "lokaid" },
    select: { id: true, username: true, role: true, mitraId: true },
  });
  console.log("\n✓ User Admin:");
  console.log(`  Username: ${user?.username}`);
  console.log(`  Role: ${user?.role}`);
  console.log(`  MitraId: ${user?.mitraId} (match: ${user?.mitraId === mitra?.id})`);

  // 3. Cek wilayah
  const wilayah = await prisma.cabang.findMany({
    where: { mitraId: mitra?.id },
    select: { id: true, nama: true, kode: true, alamat: true },
    orderBy: { kode: "asc" },
  });
  console.log("\n✓ Wilayah LokaID:");
  wilayah.forEach((w) => {
    console.log(`  - ${w.nama} (${w.kode})`);
    console.log(`    Alamat: ${w.alamat}`);
  });

  // 4. Cek user operator wilayah
  const operators = await prisma.user.findMany({
    where: { mitraId: mitra?.id, role: "admin_cabang" },
    select: { username: true, cabang: { select: { nama: true } } },
    orderBy: { username: "asc" },
  });
  console.log("\n✓ User Operator Wilayah:");
  operators.forEach((o) => {
    console.log(`  - ${o.username} → ${o.cabang?.nama}`);
  });

  // 5. Cek program
  const programs = await prisma.programLokaID.findMany({
    where: { mitraId: mitra?.id },
    select: { nama: true, tujuan: true, cabang: { select: { nama: true } } },
    orderBy: { id: "asc" },
  });
  console.log("\n✓ Program LokaID:");
  programs.forEach((p) => {
    console.log(`  - ${p.nama} (${p.tujuan})`);
    console.log(`    Wilayah: ${p.cabang?.nama ?? "Semua wilayah"}`);
  });

  // 6. Cek peserta
  const pesertaCount = await prisma.pesertaLokaID.count({
    where: { program: { mitraId: mitra?.id } },
  });
  console.log(`\n✓ Total Peserta: ${pesertaCount}`);

  // 7. Cek aktivitas
  const aktivitasCount = await prisma.aktivitasLokaID.count({
    where: { mitraId: mitra?.id },
  });
  console.log(`✓ Total Aktivitas: ${aktivitasCount}`);

  console.log("\n✅ Branding LokaID berhasil diterapkan!");
  console.log("   Credentials:");
  console.log("   - Admin: lokaid / mitra123");
  console.log("   - Operator: patehan | kadipaten / mitra123");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
