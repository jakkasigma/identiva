"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Penduduk = { id: number; nik: string; nama: string; alamat: string; uidKartu: string };
type Hasil = { kondisi: "baru" | "ada" | "konflik"; penduduk: Penduduk | null; perbedaan: string[] | null; konflikDua: Penduduk[] | null; sudahPeserta: boolean };

export function NFCScanUI({ token }: { token: string }) {
  const [uid, setUid] = useState("");
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [pakaiTersimpan, setPakaiTersimpan] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function scanNFC() {
    setError(null);
    setMessage("Dekatkan kartu ke belakang HP.");
    const Reader = (window as unknown as { NDEFReader?: new () => { scan: () => Promise<void>; onreading: ((event: { serialNumber?: string }) => void) | null; onreadingerror: (() => void) | null } }).NDEFReader;
    if (!Reader) {
      setError("Browser/HP belum support Web NFC. Isi UID manual.");
      setMessage(null);
      return;
    }
    const reader = new Reader();
    await reader.scan();
    reader.onreading = (event) => {
      const serial = event.serialNumber?.replace(/:/g, "").toUpperCase();
      if (serial) {
        setUid(serial);
        setMessage("Kartu terbaca. Klik Cek KTP.");
      }
    };
    reader.onreadingerror = () => setError("Kartu tidak terbaca. Coba tap ulang.");
  }

  async function cekKTP() {
    if (!uid && !nik) { setError("Isi UID atau NIK dulu."); return; }
    setPending(true);
    setError(null);
    setMessage(null);
    const params = new URLSearchParams();
    if (uid) params.set("uid", uid);
    if (nik) params.set("nik", nik);
    const res = await fetch(`/api/lokaid/qr/${token}/lookup?${params}`);
    const data = await res.json().catch(() => null);
    setPending(false);
    if (!res.ok) { setError(data?.error ?? "Gagal cek KTP."); return; }
    setHasil(data);
    setPakaiTersimpan(false);
  }

  const pendudukAktif = hasil?.kondisi === "ada" || pakaiTersimpan ? hasil?.penduduk : null;

  async function daftar() {
    setPending(true);
    setError(null);
    const body = pendudukAktif
      ? { uid: pendudukAktif.uidKartu, penduduk_id: pendudukAktif.id }
      : { uid, nik, nama, alamat };
    const res = await fetch(`/api/lokaid/qr/${token}/scan-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    setPending(false);
    if (!res.ok) { setError(data?.error ?? "Gagal mendaftarkan peserta."); return; }
    setMessage("Peserta berhasil didaftarkan.");
    setHasil(null); setUid(""); setNik(""); setNama(""); setAlamat("");
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Button type="button" onClick={scanNFC} className="h-12 gap-2">
          <Smartphone className="size-4" /> Scan NFC HP
        </Button>
        <Button type="button" variant="outline" onClick={cekKTP} disabled={pending}>{pending ? "Memproses..." : "Cek KTP"}</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>UID Kartu</Label><Input value={uid} onChange={(e) => setUid(e.target.value.toUpperCase())} className="font-mono" placeholder="A1B2C3D4" /></div>
        <div className="space-y-2"><Label>NIK (opsional cek manual)</Label><Input value={nik} onChange={(e) => setNik(e.target.value)} maxLength={16} className="font-mono" placeholder="3201234567890007" /></div>
      </div>

      {message && <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">{message}</p>}
      {error && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

      {hasil?.kondisi === "konflik" && !pakaiTersimpan && (
        <div className="grid gap-3 rounded-lg border border-destructive/30 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-destructive"><AlertTriangle className="size-4" /> Data konflik</div>
          {hasil.konflikDua?.length ? <p>NIK dan UID menunjuk ke dua orang berbeda. Periksa ulang.</p> : <p>Input tidak cocok dengan data tersimpan di Identiva.</p>}
          {hasil.penduduk && <Button type="button" onClick={() => setPakaiTersimpan(true)}>Gunakan Data Tersimpan</Button>}
        </div>
      )}

      {pendudukAktif && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="space-y-2 pt-6 text-sm">
            <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="size-4 text-primary" /> KTP ditemukan di Identiva</div>
            <p className="font-mono">NIK: {pendudukAktif.nik}</p>
            <p className="font-mono">UID: {pendudukAktif.uidKartu}</p>
            <p>Nama: {pendudukAktif.nama}</p>
            <p>Alamat: {pendudukAktif.alamat}</p>
            {hasil?.sudahPeserta ? <Badge variant="secondary">Sudah terdaftar di program ini</Badge> : <Button type="button" onClick={daftar} disabled={pending}>Daftarkan ke Program</Button>}
          </CardContent>
        </Card>
      )}

      {hasil?.kondisi === "baru" && (
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <div className="space-y-2"><Label>Nama</Label><Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama peserta" /></div>
            <div className="space-y-2"><Label>Alamat</Label><Input value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat lengkap" /></div>
            <div className="sm:col-span-2"><Button type="button" onClick={daftar} disabled={pending}>{pending ? "Menyimpan..." : "Daftarkan Peserta Baru"}</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
