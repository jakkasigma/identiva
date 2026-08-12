"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function QRGenerator({ programId }: { programId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  async function generate() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/lokaid/program/${programId}/qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setPending(false);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Gagal generate QR.");
      return;
    }
    setScanUrl(data.scan_url);
    setExpiresAt(data.expires_at);
  }

  async function copy() {
    if (!scanUrl) return;
    await navigator.clipboard?.writeText(scanUrl);
  }

  const qrImage = scanUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(scanUrl)}`
    : null;

  return (
    <div className="space-y-4">
      <Button type="button" onClick={generate} disabled={pending}>
        {pending ? "Membuat QR..." : scanUrl ? "Generate QR Baru" : "Generate QR Scan HP"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {scanUrl && qrImage && (
        <Card>
          <CardContent className="grid gap-4 pt-6 text-sm">
            <img src={qrImage} alt="QR scan HP" className="mx-auto size-[220px] rounded-lg border bg-white p-2" />
            <div className="break-all rounded-lg bg-muted p-3 font-mono text-xs">{scanUrl}</div>
            {expiresAt && <p className="text-xs text-muted-foreground">Berlaku sampai {new Date(expiresAt).toLocaleString("id-ID")}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copy}>Copy Link</Button>
              <a href={scanUrl} target="_blank" className="inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium" rel="noreferrer">Buka Halaman Scan</a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
