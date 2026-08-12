"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, CheckCircle2 } from "lucide-react";

type Peserta = {
  id: number;
  nik: string;
  nama: string;
  statusPeriodeIni: string | null;
  totalAktivitas: number;
};

type Props = {
  programId: number;
  peserta: Peserta[];
  periode: string;
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  lengkap:       { label: "Data Lengkap",    variant: "secondary" },
  terverifikasi: { label: "Terverifikasi",   variant: "secondary" },
  sedang:        { label: "Sedang Diisi",    variant: "outline" },
  belum:         { label: "Belum Didata",    variant: "outline" },
};

export function PendataanView({ programId, peserta, periode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  const lengkap = peserta.filter((p) =>
    p.statusPeriodeIni === "lengkap" || p.statusPeriodeIni === "terverifikasi"
  ).length;
  const belum = peserta.length - lengkap;
  const persen = peserta.length > 0 ? Math.round((lengkap / peserta.length) * 100) : 0;

  async function tandaiLengkap(pesertaId: number) {
    setLoading(pesertaId);
    try {
      await fetch("/api/lokaid/verifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: pesertaId, program_id: programId, aksi: "setujui", keterangan: "Data diverifikasi" }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <CardHeader><CardTitle className="text-base">Kelengkapan Data — {periode}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-green-500" />
              <span className="font-medium">{lengkap}</span>
              <span className="text-muted-foreground">data lengkap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="size-4 text-muted-foreground" />
              <span className="font-medium">{belum}</span>
              <span className="text-muted-foreground">belum lengkap</span>
            </div>
            <span className="ml-auto font-mono text-sm text-muted-foreground">{persen}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${persen}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{lengkap} dari {peserta.length} data terisi</p>
        </CardContent>
      </Card>

      {/* Tabel */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIK</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Status Data</TableHead>
            <TableHead>Total Aktivitas</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peserta.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada peserta.</TableCell></TableRow>
          ) : peserta.map((p) => {
            const cfg = statusConfig[p.statusPeriodeIni ?? "belum"] ?? statusConfig.belum;
            const sudahLengkap = p.statusPeriodeIni === "lengkap" || p.statusPeriodeIni === "terverifikasi";
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.nik}</TableCell>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell><Badge variant={cfg.variant}>{cfg.label}</Badge></TableCell>
                <TableCell>{p.totalAktivitas}</TableCell>
                <TableCell>
                  {!sudahLengkap && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading === p.id}
                      onClick={() => tandaiLengkap(p.id)}
                    >
                      {loading === p.id ? "..." : "Tandai Lengkap"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
