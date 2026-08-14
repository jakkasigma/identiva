import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posyandu = await prisma.programLokaID.findFirst({
    where: { nama: { contains: "Posyandu" } },
    select: { id: true, nama: true, sasaran: true, tujuan: true },
  });

  console.log("Program Posyandu:");
  console.log(JSON.stringify(posyandu, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
