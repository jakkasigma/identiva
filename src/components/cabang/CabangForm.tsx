"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Cabang = {
  id?: number;
  nama?: string;
  kode?: string;
  alamat?: string | null;
  tokenApi?: string;
  status?: string;
};

export function CabangForm({ cabang }: { cabang?: Cabang }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(cabang?.status ?? "aktif");

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const res = await fetch("/api/cabang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: cabang?.id,
        nama: formData.get("nama"),
        kode: formData.get("kode"),
        alamat: formData.get("alamat") || undefined,
        tokenApi: formData.get("tokenApi"),
        status,
      }),
    });

    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal menyimpan cabang.");
      return;
    }
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="nama">Nama Cabang</Label>
        <Input id="nama" name="nama" defaultValue={cabang?.nama} required placeholder="SPBU Fatmawati" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kode">Kode</Label>
        <Input id="kode" name="kode" defaultValue={cabang?.kode} required placeholder="SPBU-PERTA-JKT-001" className="font-mono" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="alamat">Alamat (opsional)</Label>
        <Input id="alamat" name="alamat" defaultValue={cabang?.alamat ?? ""} placeholder="Jl. Fatmawati No. 10, Jakarta" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="tokenApi">Token API IoT</Label>
        <Input id="tokenApi" name="tokenApi" defaultValue={cabang?.tokenApi} required className="font-mono" placeholder="tok_cabang_2026_..." />
        <p className="text-xs text-muted-foreground">Token ini dipakai alat ESP32 di cabang ini untuk hit API.</p>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "aktif")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="diblokir">Diblokir</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : cabang?.id ? "Simpan Perubahan" : "Tambah Cabang"}
        </Button>
      </div>
    </form>
  );
}
