import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const m = await p.mitra.count();
  const w = await p.cabang.count();
  const pl = await p.programLokaID.count();
  const pp = await p.pesertaLokaID.count();
  const act = await p.aktivitasLokaID.count();
  const dep = await p.dependentLokaID.count();
  const pend = await p.penduduk.count();
  console.log(
    "mitra", m,
    "cabang", w,
    "programLokaID", pl,
    "pesertaLokaID", pp,
    "aktivitasLokaID", act,
    "dependentLokaID", dep,
    "penduduk", pend
  );
  await p.$disconnect();
})();