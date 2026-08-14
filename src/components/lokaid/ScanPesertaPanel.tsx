import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTanggal } from "@/lib/format";
import { PesertaLokaIDForm } from "./PesertaLokaIDForm";

type Scan = {
  id: number;
  uidKartu: string;
  waktuScan: Date;
  cabang: { nama: string } | null;
};

type Program = { id: number; nama: string; sasaran?: string | null };

export function ScanPesertaPanel({ scans, programs }: { scans: Scan[]; programs: Program[] }) {
  if (scans.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Belum ada scan terbaru dari alat di lapangan.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {scans.map((scan) => (
        <Card key={scan.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-mono text-lg">{scan.uidKartu}</CardTitle>
                <CardDescription>
                  {formatTanggal(scan.waktuScan)} · {scan.cabang?.nama ?? "Wilayah tidak diketahui"}
                </CardDescription>
              </div>
              <Badge>Scan Baru</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <PesertaLokaIDForm programs={programs} uid={scan.uidKartu} scanId={scan.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}