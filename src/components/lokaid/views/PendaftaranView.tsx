"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserCheck } from "lucide-react";

type Peserta = {
  id: number;
  nik: string;
  nama: string;
  statusPeriodeIni: string | null;
  totalAktivitas: number;
  createdAt: string | Date;
};

type Props = {
  programId: number;
  peserta: Peserta[];
  periode: string;
};

const statusConfig: Record<string, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  mengajukan:  { label: "Menunggu Approval", variant: "outline" },
  disetujui:   { label: "Disetujui",         variant: "secondary" },
  aktif:       { label: "Aktif",             variant: "secondary" },
  ditolak:     { label: "Ditolak",           variant: "destructive" },
};

export function PendaftaranView({ programId, peserta, periode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<{ id: number; aksi: string } | null>(null);

  const aktif = peserta.filter((p) =>
    p.statusPeriodeIni === "aktif" || p.statusPeriodeIni === "disetujui"
  ).length;
  const menunggu = peserta.filter((p) => p.statusPeriodeIni === "mengajukan").length;

  async function proses(pesertaId: number, aksi: "setujui" | "tolak") {
    setLoading({ id: pesertaId, aksi });
    try {
      await fetch("/api/lokaid/persetujuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peserta_id: pesertaId, program_id: programId, aksi }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Anggota Aktif</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              <span className="text-2xl font-semibold">{aktif}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Menunggu Approval</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-amber-500" />
              <span className="text-2xl font-semibold">{menunggu}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIK</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Tanggal Daftar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peserta.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Belum ada pendaftar.</TableCell></TableRow>
          ) : peserta.map((p) => {
            const cfg = statusConfig[p.statusPeriodeIni ?? ""] ?? { label: "Terdaftar", variant: "outline" as const };
            const perluApproval = p.statusPeriodeIni === "mengajukan" || !p.statusPeriodeIni;
            const isLoading = loading?.id === p.id;
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-sm">{p.nik}</TableCell>
                <TableCell className="font-medium">{p.nama}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(p.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </TableCell>
                <TableCell>
                  {perluApproval && (
                    <div className="flex gap-2">
                      <Button size="sm" disabled={isLoading} onClick={() => proses(p.id, "setujui")}>
                        {isLoading && loading?.aksi === "setujui" ? "..." : "Approve"}
                      </Button>
                      <Button size="sm" variant="destructive" disabled={isLoading} onClick={() => proses(p.id, "tolak")}>
                        {isLoading && loading?.aksi === "tolak" ? "..." : "Tolak"}
                      </Button>
                    </div>
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
