"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SCAN_METHOD_LABELS, SCAN_METHODS, parseScanMethods, type ScanMethod } from "@/lib/scan-methods";

export function MitraScanPreference({ mitraId, value }: { mitraId: number; value: unknown }) {
  const router = useRouter();
  const [methods, setMethods] = useState<ScanMethod[]>(parseScanMethods(value));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(method: ScanMethod) {
    setMethods((current) => {
      if (current.includes(method)) return current.filter((m) => m !== method);
      return [...current, method];
    });
  }

  async function save() {
    if (methods.length === 0) {
      setError("Pilih minimal satu metode scan.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch(`/api/platform/mitra/${mitraId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metode_scan_diizinkan: methods }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal menyimpan preferensi scan.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {SCAN_METHODS.map((method) => (
          <label key={method} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              checked={methods.includes(method)}
              onChange={() => toggle(method)}
              className="size-4"
            />
            <span>
              <span className="block font-medium">{SCAN_METHOD_LABELS[method]}</span>
              <span className="text-xs text-muted-foreground">{method}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Preferensi"}
        </Button>
      </div>
      <Label className="text-xs text-muted-foreground">
        Admin mitra hanya bisa memilih metode aktif cabang dari daftar yang diizinkan di sini.
      </Label>
    </div>
  );
}
