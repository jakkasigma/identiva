import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NFCScanUI } from "@/components/lokaid/NFCScanUI";

export default async function PublicScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const qr = await prisma.qRToken.findUnique({
    where: { token },
    include: {
      program: { select: { nama: true, deskripsi: true, tujuan: true, status: true } },
      cabang: { select: { nama: true, kode: true, metodeScanAktif: true } },
    },
  });
  if (!qr || qr.expiresAt < new Date() || qr.program.status !== "aktif") notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">Identiva Scan</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Scan Kartu Peserta</h1>
          <p className="mt-2 text-muted-foreground">Gunakan HP NFC atau input UID manual.</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{qr.program.nama}</CardTitle>
                <CardDescription>{qr.cabang.nama} · {qr.cabang.kode}</CardDescription>
              </div>
              <Badge variant="secondary">{qr.cabang.metodeScanAktif}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <NFCScanUI token={token} />
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          QR berlaku sampai {qr.expiresAt.toLocaleString("id-ID")}. Jika NFC tidak tersedia, gunakan input UID manual.
        </p>
      </div>
    </main>
  );
}
