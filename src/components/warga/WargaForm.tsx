"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WargaForm({ uid, scanId }: { uid?: string; scanId?: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const res = await fetch("/api/warga", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nik: formData.get("nik"),
        nama: formData.get("nama"),
        alamat: formData.get("alamat"),
        uid_kartu: formData.get("uid_kartu"),
        scan_pending_id: scanId,
      }),
    });

    setPending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal menyimpan warga.");
      return;
    }

    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="nik">NIK</Label>
        <Input id="nik" name="nik" required minLength={16} maxLength={16} className="font-mono" placeholder="3201234567890007" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="uid_kartu">UID Kartu</Label>
        <Input id="uid_kartu" name="uid_kartu" required defaultValue={uid} className="font-mono" placeholder="A1B2C3D4" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nama">Nama</Label>
        <Input id="nama" name="nama" required placeholder="Nama warga" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="alamat">Alamat</Label>
        <Input id="alamat" name="alamat" required placeholder="Alamat lengkap" />
      </div>
      {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Warga"}</Button>
      </div>
    </form>
  );
}
