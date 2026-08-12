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
  bersubsidi?: boolean;
  diskon?: number;
  periodeReset?: string;
};

export function ProgramForm({ program }: { program?: Program }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bersubsidi, setBersubsidi] = useState(program?.bersubsidi ?? true);
  const [periodeReset, setPeriodeReset] = useState(program?.periodeReset ?? "bulanan");

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const res = await fetch("/api/program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: program?.id,
        nama: formData.get("nama"),
        bersubsidi,
        diskon: bersubsidi ? formData.get("diskon") : 0,
        periode_reset: periodeReset,
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

  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="nama">Nama Program</Label>
        <Input id="nama" name="nama" defaultValue={program?.nama} required placeholder="Pertalite" />
      </div>

      {/* Toggle bersubsidi */}
      <div className="flex items-center gap-3 md:col-span-2">
        <button
          type="button"
          role="switch"
          aria-checked={bersubsidi}
          onClick={() => setBersubsidi((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${bersubsidi ? "bg-primary" : "bg-input"}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${bersubsidi ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <Label className="cursor-pointer" onClick={() => setBersubsidi((v) => !v)}>
          Produk Bersubsidi
        </Label>
        {!bersubsidi && (
          <span className="text-xs text-muted-foreground">(transaksi normal, tidak masuk alur saldo)</span>
        )}
      </div>

      {bersubsidi && (
        <div className="space-y-2">
          <Label htmlFor="diskon">Diskon (%)</Label>
          <Input
            id="diskon"
            name="diskon"
            type="number"
            min={0}
            max={100}
            defaultValue={program?.diskon ?? 0}
            required
          />
        </div>
      )}

      <div className={`space-y-2 ${bersubsidi ? "" : "md:col-span-2"}`}>
        <Label>Periode Reset Saldo</Label>
        <Select value={periodeReset} onValueChange={(v) => setPeriodeReset(v ?? "bulanan")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="harian">Harian</SelectItem>
            <SelectItem value="mingguan">Mingguan</SelectItem>
            <SelectItem value="bulanan">Bulanan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? <p className="text-sm text-destructive md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : program?.id ? "Simpan Perubahan" : "Tambah Program"}
        </Button>
      </div>
    </form>
  );
}
