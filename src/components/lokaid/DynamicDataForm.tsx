"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FieldDef = {
  fieldId: number;
  nama: string;
  kode: string;
  tipe: "text" | "number" | "date" | "dropdown" | "radio" | "checkbox";
  wajib: boolean;
  opsi: string[] | null;
  nilai: string | null;
};

type Props = {
  pesertaId: number;
  fields: FieldDef[];
  onDone?: () => void;
};

export function DynamicDataForm({ pesertaId, fields, onDone }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of fields) {
      if (f.nilai !== null) init[f.kode] = f.nilai;
    }
    return init;
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(kode: string, val: string) {
    setValues((v) => ({ ...v, [kode]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/lokaid/peserta/${pesertaId}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal menyimpan data.");
        return;
      }
      router.refresh();
      onDone?.();
    } finally {
      setPending(false);
    }
  }

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Program ini tidak memiliki field tambahan.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map((f) => (
        <div key={f.fieldId} className="space-y-2">
          <Label>
            {f.nama}
            {f.wajib && <span className="text-destructive ml-1">*</span>}
          </Label>

          {f.tipe === "text" && (
            <Input value={values[f.kode] ?? ""} onChange={(e) => setValue(f.kode, e.target.value)} required={f.wajib} />
          )}
          {f.tipe === "number" && (
            <Input type="number" value={values[f.kode] ?? ""} onChange={(e) => setValue(f.kode, e.target.value)} required={f.wajib} />
          )}
          {f.tipe === "date" && (
            <Input type="date" value={values[f.kode] ?? ""} onChange={(e) => setValue(f.kode, e.target.value)} required={f.wajib} />
          )}
          {f.tipe === "dropdown" && f.opsi && (
            <Select value={values[f.kode] ?? ""} onValueChange={(v) => setValue(f.kode, v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
              <SelectContent>
                {f.opsi.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {f.tipe === "radio" && f.opsi && (
            <div className="flex flex-wrap gap-3">
              {f.opsi.map((o) => (
                <label key={o} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="radio" name={f.kode} value={o} checked={values[f.kode] === o}
                    onChange={() => setValue(f.kode, o)} required={f.wajib} />
                  {o}
                </label>
              ))}
            </div>
          )}
          {f.tipe === "checkbox" && f.opsi && (
            <div className="flex flex-wrap gap-3">
              {f.opsi.map((o) => {
                const checked = (values[f.kode] ?? "").split(",").filter(Boolean).includes(o);
                return (
                  <label key={o} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={() => {
                      const current = (values[f.kode] ?? "").split(",").filter(Boolean);
                      const next = checked ? current.filter((x) => x !== o) : [...current, o];
                      setValue(f.kode, next.join(","));
                    }} />
                    {o}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan Data"}
      </Button>
    </form>
  );
}
