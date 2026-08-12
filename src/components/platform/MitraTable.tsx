import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SCAN_METHOD_LABELS, parseScanMethods } from "@/lib/scan-methods";

type MitraRow = {
  id: number;
  nama: string;
  kode: string;
  tipeMitra: string;
  status: string;
  metodeScanDiizinkan: unknown;
  _count: { cabang: number; warga: number; programLokaID: number; transaksi: number };
};

export function MitraTable({ mitra }: { mitra: MitraRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mitra</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Metode Scan</TableHead>
          <TableHead>Cabang</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mitra.map((m) => (
          <TableRow key={m.id}>
            <TableCell>
              <div className="font-medium">{m.nama}</div>
              <div className="font-mono text-xs text-muted-foreground">{m.kode}</div>
            </TableCell>
            <TableCell><Badge variant="outline">{m.tipeMitra}</Badge></TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {parseScanMethods(m.metodeScanDiizinkan).map((method) => (
                  <Badge key={method} variant="secondary" className="text-xs">{SCAN_METHOD_LABELS[method]}</Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{m._count.cabang}</TableCell>
            <TableCell><Badge variant={m.status === "aktif" ? "secondary" : "destructive"}>{m.status}</Badge></TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/platform/mitra/${m.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Detail</Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
