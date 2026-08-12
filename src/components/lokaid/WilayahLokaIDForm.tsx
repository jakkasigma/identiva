"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { SCAN_METHOD_LABELS, type ScanMethod } from "@/lib/scan-methods";

type Wilayah = {
  id?: number;
  nama?: string;
  kode?: string;
  alamat?: string | null;
  tokenApi?: string;
  status?: string;
  metodeScanAktif?: string;
};

function generateToken(nama: string): string {
  const slug = nama.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 10);
  return `tok_wil_${slug}_2026_${rand}`;
}

export function WilayahLokaIDForm({ wilayah, allowedMethods = ["hp_nfc"] }: { wilayah?: Wilayah; allowedMethods?: ScanMethod[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(wilayah?.tokenApi ?? "");
  const [namaWilayah, setNamaWilayah] = useState(wilayah?.nama ?? "");
  const [statusWilayah, setStatusWilayah] = useState(wilayah?.status ?? "aktif");
  const [metodeScanAktif, setMetodeScanAktif] = useState(wilayah?.metodeScanAktif ?? allowedMethods[0] ?? "hp_nfc");

  const isEdit = !!wilayah?.id;

  function handleGenerateToken() {
    setToken(generateToken(namaWilayah || "wilayah"));
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const res = await fetch("/api/lokaid/wilayah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: wilayah?.id,
        nama:     formData.get("nama"),
        kode:     formData.get("kode"),
        alamat:   formData.get("alamat") || null,
        tokenApi: token,
        status:   statusWilayah,
        metodeScanAktif,
        // akun operator (hanya saat buat baru)
        username: isEdit ? undefined : formData.get("username") || undefined,
        password: isEdit ? undefined : formData.get("password") || undefined,
      }),
    });

    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal menyimpan wilayah.");
      return;
    }
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      {/* Nama */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="nama">Nama Wilayah <span className="text-destructive">*</span></Label>
        <Input id="nama" name="nama" value={namaWilayah}
          onChange={(e) => setNamaWilayah(e.target.value)}
          required placeholder="Kecamatan Sukasari" />
      </div>

      {/* Kode */}
      <div className="space-y-2">
        <Label htmlFor="kode">Kode <span className="text-destructive">*</span></Label>
        <Input id="kode" name="kode" defaultValue={wilayah?.kode}
          required placeholder="WIL-01" className="font-mono" />
        <p className="text-xs text-muted-foreground">Kode unik singkat untuk wilayah ini.</p>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={statusWilayah} onValueChange={(v) => setStatusWilayah(v ?? "aktif")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="diblokir">Diblokir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Metode Scan Aktif</Label>
        <Select value={metodeScanAktif} onValueChange={(v) => setMetodeScanAktif((v ?? allowedMethods[0] ?? "hp_nfc") as ScanMethod)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {allowedMethods.map((method) => (
              <SelectItem key={method} value={method}>{SCAN_METHOD_LABELS[method]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Pilihan difilter dari izin admin platform.</p>
      </div>

      {/* Alamat */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="alamat">Alamat <span className="text-muted-foreground text-sm">(opsional)</span></Label>
        <Input id="alamat" name="alamat" defaultValue={wilayah?.alamat ?? ""}
          placeholder="Jl. Sukasari No. 1, Bandung" />
      </div>

      {/* Token API */}
      <div className="space-y-2 md:col-span-2">
        <Label>Token API IoT <span className="text-destructive">*</span></Label>
        <div className="flex gap-2">
          <Input value={token} onChange={(e) => setToken(e.target.value)}
            required className="font-mono text-sm flex-1" placeholder="tok_wil_..." />
          <Button type="button" variant="outline" size="sm" onClick={handleGenerateToken}
            title="Generate token otomatis">
            <RefreshCw className="size-3.5 mr-1" /> Generate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Token untuk perangkat ESP32/RFID di wilayah ini. Klik Generate untuk buat otomatis.
        </p>
      </div>

      {/* Akun operator — hanya saat buat baru */}
      {!isEdit && (
        <>
          <div className="md:col-span-2 border-t pt-4">
            <p className="text-sm font-medium mb-1">Akun Login Operator Wilayah</p>
            <p className="text-xs text-muted-foreground">
              Opsional — jika diisi, akan dibuat akun login untuk admin wilayah ini.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="sukasari" className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 6 karakter" />
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Wilayah"}
        </Button>
      </div>
    </form>
  );
}
