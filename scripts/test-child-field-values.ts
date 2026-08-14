import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posyandu = await prisma.programLokaID.findFirst({
    where: { nama: { contains: "Posyandu" } },
    include: { fields: true, peserta: { include: { penduduk: true, dependents: true }, take: 1 } },
  });

  if (!posyandu) throw new Error("Program Posyandu tidak ditemukan");
  const peserta = posyandu.peserta.find((p) => p.dependents.length > 0);
  if (!peserta) throw new Error("Peserta dengan anak tidak ditemukan");
  const anak = peserta.dependents[0];

  await prisma.pesertaFieldValueLokaID.deleteMany({
    where: { pesertaId: peserta.id, dependentId: anak.id },
  });

  for (const field of posyandu.fields) {
    const nilai = field.kode === "berat_badan" ? "8.8"
      : field.kode === "tinggi_badan" ? "76"
      : field.kode === "status_gizi" ? "Baik"
      : "Test catatan anak";

    await prisma.pesertaFieldValueLokaID.create({
      data: { pesertaId: peserta.id, dependentId: anak.id, fieldId: field.id, nilai },
    });
  }

  const values = await prisma.pesertaFieldValueLokaID.findMany({
    where: { pesertaId: peserta.id, dependentId: anak.id },
    include: { field: true, dependent: true, peserta: { include: { penduduk: true } } },
    orderBy: { fieldId: "asc" },
  });

  console.log("OK field values anak tersimpan");
  console.log(`Wali: ${peserta.penduduk.nama}`);
  console.log(`Anak: ${anak.nama}`);
  for (const value of values) console.log(`${value.field.nama}: ${value.nilai}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(() => prisma.$disconnect());
