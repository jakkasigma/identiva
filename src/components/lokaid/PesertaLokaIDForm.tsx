"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Program = { id: number; nama: string; sasaran?: string | null };
type Penduduk = { id: number; nik: string; nama: string; alamat: string; uidKartu: string };
type Hasil = {
  kondisi: "baru" | "ada" | "konflik";
  penduduk: Penduduk | null;
  perbedaan: string[] | null;
  konflikDua: Penduduk[] | null;
  sudahPeserta: boolean | null;
};
type DataAnak = { nama: string; tanggalLahir: string; jenisKelamin: string };

export function PesertaLokaIDForm({ programs, uid, scanId }: { programs: Program[]; uid?: string; scanId?: number }) {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [uidKartu, setUidKartu] = useState(uid ?? "");
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [programId, setProgramId] = useState("");
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [cekState, setCekState] = useState<"idle" | "loading" | "done">("idle");
  const [pakaiTersimpan, setPakaiTersimpan] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk data anak
  const [dataAnak, setDataAnak] = useState<DataAnak[]>([{ nama: "", tanggalLahir: "", jenisKelamin: "" }]);
  
  // Cek apakah program yang dipilih sasarannya anak
  const programDipilih = programs.find((p) => String(p.id) === programId);
  const isProgramAnak = programDipilih?.sasaran === "anak";

  const cekKTP = useCallback(async (qNik: string, qUid: string, qProgram: string) => {
    setCekState("loading");
    setError(null);
    setPakaiTersimpan(false);
    try {
      const params = new URLSearchParams();
      if (qNik) params.set("nik", qNik);
      if (qUid) params.set("uid", qUid);
      if (qProgram) params.set("program_id", qProgram);
      const res = await fetch(`/api/lokaid/cari-penduduk?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Gagal cek KTP");
      setHasil(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal cek KTP");
      setHasil(null);
    } finally {
      setCekState("done");
    }
  }, []);

  // Auto-cek sekali saat form dibuka dari hasil scan (UID sudah diketahui)
  const autoCekDone = useRef(false);
  useEffect(() => {
    if (uid && !autoCekDone.current) {
      autoCekDone.current = true;
      const t = setTimeout(() => cekKTP("", uid, ""), 0);
      return () => clearTimeout(t);
    }
  }, [uid, cekKTP]);

  function handleCek() {
    if (!nik.trim() && !uidKartu.trim()) {
      setError("Isi NIK atau UID kartu untuk mengecek KTP.");
      return;
    }
    setCekState("loading");
    cekKTP(nik.trim(), uidKartu.trim(), programId);
  }

  function handleProgramChange(value: string) {
    setProgramId(value);
    // Cek ulang status "sudah terdaftar" jika penduduk sudah ketemu
    if (hasil && (hasil.kondisi === "ada" || pakaiTersimpan) && hasil.penduduk) {
      cekKTP(nik.trim(), hasil.penduduk.uidKartu, value);
    }
  }

  function resetCek() {
    setCekState("idle");
    setHasil(null);
    setPakaiTersimpan(false);
    setError(null);
  }

  const pendudukAktif = (hasil?.kondisi === "ada" || pakaiTersimpan) ? (hasil?.penduduk ?? null) : null;

  async function daftarkan() {
    if (!programId) {
      setError("Pilih program tujuan dulu.");
      return;
    }
    
    // Validasi data anak jika program sasaran anak
    if (isProgramAnak) {
      const anakValid = dataAnak.filter((a) => a.nama.trim());
      if (anakValid.length === 0) {
        setError("Isi minimal 1 data anak untuk program sasaran anak.");
        return;
      }
    }
    
    setPending(true);
    setError(null);
    try {
      const body = pendudukAktif
        ? { 
            penduduk_id: pendudukAktif.id, 
            program_id: Number(programId), 
            scan_pending_id: scanId,
            anak: isProgramAnak ? dataAnak.filter((a) => a.nama.trim()) : undefined,
          }
        : { 
            nik, 
            nama, 
            alamat, 
            uid_kartu: uidKartu, 
            program_id: Number(programId), 
            scan_pending_id: scanId,
            anak: isProgramAnak ? dataAnak.filter((a) => a.nama.trim()) : undefined,
          };

      const res = await fetch("/api/lokaid/peserta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Gagal menyimpan peserta.");

      resetCek();
      if (!uid) setUidKartu("");
      setProgramId("");
      setNama("");
      setAlamat("");
      setDataAnak([{ nama: "", tanggalLahir: "", jenisKelamin: "" }]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan peserta.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="nik">NIK</Label>
          <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} maxLength={16} className="font-mono" placeholder="3201234567890007" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uid_kartu">UID Kartu</Label>
          <Input id="uid_kartu" value={uidKartu} onChange={(e) => setUidKartu(e.target.value)} className="font-mono" placeholder="A1B2C3D4" />
        </div>
        <div className="space-y-2">
          <Label>Program</Label>
          <Select value={programId || null} onValueChange={(v) => handleProgramChange(String(v ?? ""))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Pilih program" /></SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" onClick={handleCek} disabled={cekState === "loading"}>
          {cekState === "loading" ? "Mengecek..." : "Cek KTP"}
        </Button>
        {cekState === "done" && (
          <Button type="button" variant="outline" onClick={resetCek}>Cek ulang</Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {cekState === "done" && hasil ? (
        <div className="grid gap-4 border-t pt-4">
          {hasil.kondisi === "konflik" && !pakaiTersimpan && !pendudukAktif ? (
            hasil.konflikDua && hasil.konflikDua.length === 2 ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <p>
                  NIK dan UID menunjuk ke <span className="font-medium">dua orang berbeda</span> di Identiva. Periksa kembali inputmu.
                </p>
              </div>
            ) : hasil.penduduk ? (
              <div className="grid gap-4">
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p>
                    {hasil.perbedaan?.includes("nik")
                      ? "NIK yang kamu isi tidak cocok dengan data tersimpan."
                      : "UID kartu yang kamu isi tidak cocok dengan data tersimpan."}
                    {" "}Data tersimpan — NIK <span className="font-mono">{hasil.penduduk.nik}</span> · UID <span className="font-mono">{hasil.penduduk.uidKartu}</span>
                  </p>
                </div>
                <Card>
                  <CardContent className="pt-6 text-sm">
                    <p className="font-medium">Data yang sudah tersimpan di Identiva</p>
                    <p className="mt-1">Nama: {hasil.penduduk.nama}</p>
                    <p>Alamat: {hasil.penduduk.alamat}</p>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => setPakaiTersimpan(true)} disabled={!programId}>Gunakan data tersimpan</Button>
                  <Button type="button" variant="outline" onClick={resetCek}>Batal</Button>
                </div>
              </div>
            ) : null
          ) : pendudukAktif ? (
            <div className="grid gap-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="gap-2 pt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <p className="font-medium">KTP sudah ada di Identiva</p>
                  </div>
                  <div className="mt-2 grid gap-1 font-mono">
                    <p>NIK: {pendudukAktif.nik}</p>
                    <p>UID: {pendudukAktif.uidKartu}</p>
                  </div>
                  <p className="mt-2 font-medium">Nama: {pendudukAktif.nama}</p>
                  <p>Alamat: {pendudukAktif.alamat}</p>
                  {pakaiTersimpan && <p className="mt-2 text-xs text-muted-foreground">Memakai data yang sudah tersimpan di Identiva.</p>}
                </CardContent>
              </Card>
              {hasil.sudahPeserta ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">Sudah terdaftar</Badge> di program ini.
                </p>
              ) : (
                <div>
                  <Button type="button" onClick={daftarkan} disabled={pending || !programId}>
                    {pending ? "Menyimpan..." : "Daftarkan ke Program"}
                  </Button>
                </div>
              )}
              
              {/* Section Data Anak untuk program sasaran anak */}
              {isProgramAnak && !hasil.sudahPeserta && (
                <div className="grid gap-4 border-t pt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data Anak yang Didaftarkan</p>
                    <p className="text-xs text-muted-foreground">
                      Program ini untuk anak. Isi data anak yang akan didaftarkan ke program.
                    </p>
                  </div>
                  
                  {dataAnak.map((anak, idx) => (
                    <div key={idx} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`anak_nama_${idx}`}>Nama Anak *</Label>
                        <Input
                          id={`anak_nama_${idx}`}
                          value={anak.nama}
                          onChange={(e) => {
                            const newData = [...dataAnak];
                            newData[idx].nama = e.target.value;
                            setDataAnak(newData);
                          }}
                          placeholder="Nama lengkap anak"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`anak_tgl_${idx}`}>Tanggal Lahir</Label>
                        <Input
                          id={`anak_tgl_${idx}`}
                          type="date"
                          value={anak.tanggalLahir}
                          onChange={(e) => {
                            const newData = [...dataAnak];
                            newData[idx].tanggalLahir = e.target.value;
                            setDataAnak(newData);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`anak_jk_${idx}`}>Jenis Kelamin</Label>
                        <Select
                          value={anak.jenisKelamin || ""}
                          onValueChange={(v) => {
                            const newData = [...dataAnak];
                            newData[idx].jenisKelamin = v || "";
                            setDataAnak(newData);
                          }}
                        >
                          <SelectTrigger id={`anak_jk_${idx}`}>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {dataAnak.length > 1 && (
                        <div className="flex items-end md:col-span-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDataAnak(dataAnak.filter((_, i) => i !== idx));
                            }}
                          >
                            Hapus Anak Ini
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDataAnak([...dataAnak, { nama: "", tanggalLahir: "", jenisKelamin: "" }]);
                      }}
                    >
                      + Tambah Anak Lain
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Nama peserta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} required placeholder="Alamat lengkap" />
              </div>
              
              {/* Section Data Anak untuk program sasaran anak (penduduk baru) */}
              {isProgramAnak && (
                <div className="grid gap-4 border-t pt-4 md:col-span-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data Anak yang Didaftarkan</p>
                    <p className="text-xs text-muted-foreground">
                      Program ini untuk anak. Isi data anak yang akan didaftarkan ke program.
                    </p>
                  </div>
                  
                  {dataAnak.map((anak, idx) => (
                    <div key={idx} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`anak_nama_baru_${idx}`}>Nama Anak *</Label>
                        <Input
                          id={`anak_nama_baru_${idx}`}
                          value={anak.nama}
                          onChange={(e) => {
                            const newData = [...dataAnak];
                            newData[idx].nama = e.target.value;
                            setDataAnak(newData);
                          }}
                          placeholder="Nama lengkap anak"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`anak_tgl_baru_${idx}`}>Tanggal Lahir</Label>
                        <Input
                          id={`anak_tgl_baru_${idx}`}
                          type="date"
                          value={anak.tanggalLahir}
                          onChange={(e) => {
                            const newData = [...dataAnak];
                            newData[idx].tanggalLahir = e.target.value;
                            setDataAnak(newData);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`anak_jk_baru_${idx}`}>Jenis Kelamin</Label>
                        <Select
                          value={anak.jenisKelamin || ""}
                          onValueChange={(v) => {
                            const newData = [...dataAnak];
                            newData[idx].jenisKelamin = v || "";
                            setDataAnak(newData);
                          }}
                        >
                          <SelectTrigger id={`anak_jk_baru_${idx}`}>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {dataAnak.length > 1 && (
                        <div className="flex items-end md:col-span-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDataAnak(dataAnak.filter((_, i) => i !== idx));
                            }}
                          >
                            Hapus Anak Ini
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDataAnak([...dataAnak, { nama: "", tanggalLahir: "", jenisKelamin: "" }]);
                      }}
                    >
                      + Tambah Anak Lain
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <Button type="button" onClick={daftarkan} disabled={pending || !programId}>
                  {pending ? "Menyimpan..." : "Daftarkan Peserta"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Isi NIK atau UID kartu lalu tekan <span className="font-medium">Cek KTP</span>. Kalau data sudah ada di Identiva,
          kamu tidak perlu mengisi ulang nama dan alamat.
        </p>
      )}
    </div>
  );
}