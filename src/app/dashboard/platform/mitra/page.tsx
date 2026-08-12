import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MitraTable } from "@/components/platform/MitraTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlatformMitraPage() {
  const session = await auth();
  if (session?.user?.role !== "admin_platform") redirect("/dashboard");

  const mitra = await prisma.mitra.findMany({
    include: { _count: { select: { cabang: true, warga: true, programLokaID: true, transaksi: true } } },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Platform</p>
        <h1 className="font-display text-4xl font-semibold">Mitra</h1>
        <p className="mt-2 text-muted-foreground">Kelola mitra dan metode scan yang diizinkan.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Mitra</CardTitle>
          <CardDescription>{mitra.length} mitra terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <MitraTable mitra={mitra} />
        </CardContent>
      </Card>
    </div>
  );
}
