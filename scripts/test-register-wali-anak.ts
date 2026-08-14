import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Test: Register Wali + Anak ke Posyandu\n");

  // 1. Cari program Posyandu
  const posyandu = await prisma.programLokaID.findFirst({
    where: { nama: { contains: "Posyandu" } },
    select: { id: true, nama: true, sasaran: true },
  });

  if (!posyandu) {
    console.error("❌ Program Posyandu tidak ditemukan");
    return;
  }

  console.log(`✓ Program: ${posyandu.nama} (sasaran: ${posyandu.sasaran})`);

  // 2. Buat data test wali baru
  const testNIK = "3201234567890099";
  const testUID = "TEST9999";

  // Hapus test data lama jika ada
  const existingPenduduk = await prisma.penduduk.findUnique({ where: { nik: testNIK } });
  if (existingPenduduk) {
    await prisma.dependentLokaID.deleteMany({ where: { wali: { pendudukId: existingPenduduk.id } } });
    await prisma.pesertaLokaID.deleteMany({ where: { pendudukId: existingPenduduk.id } });
    await prisma.penduduk.delete({ where: { id: existingPenduduk.id } });
    console.log("✓ Hapus test data lama");
  }

  // 3. Simulate API call: register wali + 2 anak
  const body = {
    nik: testNIK,
    nama: "Test Wali Posyandu",
    alamat: "Jl. Test No. 99, Yogyakarta",
    uid_kartu: testUID,
    program_id: posyandu.id,
    anak: [
      { nama: "Test Anak 1", tanggalLahir: "2024-01-15", jenisKelamin: "L" },
      { nama: "Test Anak 2", tanggalLahir: "2025-06-20", jenisKelamin: "P" },
    ],
  };

  console.log("\n📝 Data yang akan didaftarkan:");
  console.log(`   Wali: ${body.nama} (NIK: ${body.nik})`);
  console.log(`   Anak 1: ${body.anak[0].nama} (${body.anak[0].jenisKelamin}, ${body.anak[0].tanggalLahir})`);
  console.log(`   Anak 2: ${body.anak[1].nama} (${body.anak[1].jenisKelamin}, ${body.anak[1].tanggalLahir})`);

  // 4. Execute transaction (simulasi API logic)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create penduduk (wali)
      const penduduk = await tx.penduduk.create({
        data: {
          nik: body.nik,
          nama: body.nama,
          alamat: body.alamat,
          uidKartu: body.uid_kartu,
        },
      });

      // Create peserta (wali sebagai peserta)
      const peserta = await tx.pesertaLokaID.create({
        data: {
          pendudukId: penduduk.id,
          programId: body.program_id,
          cabangId: null, // admin induk
        },
      });

      // Create dependents (anak-anak)
      const anakRecords = [];
      for (const anak of body.anak) {
        const dep = await tx.dependentLokaID.create({
          data: {
            waliId: peserta.id,
            nama: anak.nama,
            tanggalLahir: new Date(anak.tanggalLahir),
            jenisKelamin: anak.jenisKelamin,
          },
        });
        anakRecords.push(dep);
      }

      return { peserta, anak: anakRecords };
    });

    console.log("\n✅ Pendaftaran berhasil!");
    console.log(`   Peserta ID: ${result.peserta.id}`);
    console.log(`   Jumlah anak terdaftar: ${result.anak.length}`);

    // 5. Verify data
    const verify = await prisma.pesertaLokaID.findUnique({
      where: { id: result.peserta.id },
      include: {
        penduduk: true,
        program: { select: { nama: true, sasaran: true } },
        dependents: { select: { id: true, nama: true, tanggalLahir: true, jenisKelamin: true } },
      },
    });

    console.log("\n🔍 Verifikasi data tersimpan:");
    console.log(`   Wali: ${verify?.penduduk.nama} (NIK: ${verify?.penduduk.nik})`);
    console.log(`   Program: ${verify?.program.nama} (sasaran: ${verify?.program.sasaran})`);
    console.log(`   Anak terdaftar:`);
    verify?.dependents.forEach((a, idx) => {
      console.log(`     ${idx + 1}. ${a.nama} (${a.jenisKelamin}, ${a.tanggalLahir?.toISOString().split("T")[0]})`);
    });

    console.log("\n✅ Test PASSED: Wali + Anak berhasil terdaftar sekaligus!");
  } catch (error) {
    console.error("\n❌ Test FAILED:");
    console.error(error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
