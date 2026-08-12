"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

type Warga = {
  id: number;
  status: string;
  penduduk: { nik: string; nama: string; alamat: string; uidKartu: string };
  saldo: { saldoTotal: number; saldoTerpakai: number } | null;
};

export function WargaTable({ warga }: { warga: Warga[] }) {
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? warga.filter(
        (item) =>
          item.penduduk.nama.toLowerCase().includes(q.toLowerCase()) ||
          item.penduduk.nik.includes(q),
      )
    : warga;

  if (warga.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Belum ada warga. Scan kartu atau daftar manual dulu.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Cari nama atau NIK..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIK</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Saldo Terpakai</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Tidak ada hasil untuk &ldquo;{q}&rdquo;
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.penduduk.nik}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.penduduk.nama}</div>
                    <div className="text-xs text-muted-foreground">{item.penduduk.alamat}</div>
                  </TableCell>
                  <TableCell className="font-mono">{item.penduduk.uidKartu}</TableCell>
                  <TableCell className="font-mono">
                    {item.saldo
                      ? `${formatRupiah(item.saldo.saldoTerpakai)} / ${formatRupiah(item.saldo.saldoTotal)}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "aktif" ? "secondary" : "destructive"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
