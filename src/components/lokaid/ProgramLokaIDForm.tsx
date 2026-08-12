"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Program = {
  id?: number;
  nama?: string;
  deskripsi?: string | null;
  tujuan?: string;
  kuotaTotal?: number | null;
  periodeReset?: string;
  perluVerifikasi?: boolean;
  status?: string;
  tanggalMulai?: Date | null;
  tanggalSelesai?: Date | null;
};

export function ProgramLokaIDForm({ program }: { program?: Program }) {
  const router = useRouter();
  const [pending, setPending]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [tujuan, setTujuan]               = useState(program?.tujuan ?? "kegiatan");
  const [periodeReset, setPeriodeReset]   = useState(program?.periodeReset ?? "bulanan");
  const [status, setStatus]               = useState(program?.status ?? "aktif");
  const [perluVerifikasi, setPerluVerifikasi] = useState(program?.perluVerifikasi ?? false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const kuotaRaw = formData.get("kuota_total") as string;

    const res = await fetch("/api/lokaid/program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: program?.id,
        nama: formData.get("nama"),
        deskripsi: formData.get("deskripsi") || undefined,
        tujuan,
        periodeReset,
        status,
        perluVerifikasi,
        kuotaTotal: kuotaRaw ? Number(kuotaRaw) : null,
        tanggalMulai: formData.get("tanggal_mulai") || null,
        tanggalSelesai: formData.get("tanggal_selesai") || null,
      }),
    });

    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal menyimpan program.");
      return;
    }
    router.refresh();
  }

  const fmt = (d?: Date | null) => d ? new Date(d).toISOString().slice(0, 10) : "";

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="nama">Nama Program</Label>
        <Input id="nama" name="nama" defaultValue={program?.nama} required placeholder="Bantuan Sembako Agustus" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
        <Input id="deskripsi" name="deskripsi" defaultValue={program?.deskripsi ?? ""} placeholder="Keterangan singkat program" />
      </div>

      <div className="space-y-2">
        <Label>Tujuan Program</Label>
        <Select value={tujuan} onValueChange={(v) => setTujuan(v ?? "kegiatan")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="bantuan">Memberikan Bantuan</SelectItem>
            <SelectItem value="kegiatan">Mengadakan Kegiatan</SelectItem>
            <SelectItem value="pendataan">Mengumpulkan Data</SelectItem>
            <SelectItem value="peminjaman">Meminjamkan Barang/Fasilitas</SelectItem>
            <SelectItem value="pendaftaran">Mendaftarkan Warga</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kuota_total">Kuota per Periode</Label>
        <Input id="kuota_total" name="kuota_total" type="number" min={1}
          defaultValue={program?.kuotaTotal ?? ""} placeholder="Kosongkan = tidak terbatas" />
      </div>

      <div className="space-y-2">
        <Label>Periode Reset Kuota</Label>
        <Select value={periodeReset} onValueChange={(v) => setPeriodeReset(v ?? "bulanan")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sekali">Sekali (tidak reset)</SelectItem>
            <SelectItem value="harian">Harian</SelectItem>
            <SelectItem value="mingguan">Mingguan</SelectItem>
            <SelectItem value="bulanan">Bulanan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "aktif")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
        <Input id="tanggal_mulai" name="tanggal_mulai" type="date" defaultValue={fmt(program?.tanggalMulai)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
        <Input id="tanggal_selesai" name="tanggal_selesai" type="date" defaultValue={fmt(program?.tanggalSelesai)} />
      </div>

      <div className="flex items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          id="perlu_verifikasi"
          checked={perluVerifikasi}
          onChange={(e) => setPerluVerifikasi(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="perlu_verifikasi" className="cursor-pointer">Perlu verifikasi/persetujuan admin</Label>
      </div>

      {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : program?.id ? "Simpan Perubahan" : "Buat Program"}
        </Button>
      </div>
    </form>
  );
}
