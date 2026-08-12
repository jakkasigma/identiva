import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, Radio, ShieldCheck } from "lucide-react";
import { RfidCard } from "@/components/RfidCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const programs = ["BBM Solar", "LPG 3kg", "Pupuk", "Bansos Sembako"];
const steps = [
  { title: "Scan Kartu", desc: "Warga menempelkan kartu RFID simulasi KTP di terminal mitra." },
  { title: "Validasi Kuota", desc: "ESP32 mengirim UID ke web via bridge PC untuk cek kuota real-time." },
  { title: "Transaksi Tercatat", desc: "Diskon dihitung server, kuota dipotong, laporan siap diekspor." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-mono text-sm font-semibold uppercase tracking-[0.28em] text-primary">Identiva</Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">Login</Link>
          <Link href="/login" className={buttonVariants()}>Dashboard</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <Badge className="bg-accent text-accent-foreground hover:bg-accent">Subsidi berbasis identitas</Badge>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">
            Satu Kartu untuk Semua Subsidi.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Identiva membantu mitra memvalidasi penerima, mengatur kuota, menghitung diskon, dan membuat rekap transaksi subsidi secara real-time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>Coba Dashboard <ArrowRight className="ml-2 size-4" /></Link>
            <Link href="/dashboard/rekap" className={buttonVariants({ size: "lg", variant: "outline" })}>Lihat Rekap</Link>
          </div>
        </div>
        <RfidCard className="mx-auto w-full max-w-lg" />
      </section>

      <section className="border-y bg-card/70 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Cara Kerja</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Alur sederhana, data rapi.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <CardHeader>
                  <div className="mb-4 grid size-10 place-items-center rounded-full bg-primary font-mono text-primary-foreground">{index + 1}</div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{step.desc}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Program</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Siap untuk banyak jenis subsidi.</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {programs.map((program) => <Badge key={program} variant="secondary">{program}</Badge>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader><ShieldCheck className="mb-3 size-8 text-primary" /><CardTitle>Multi-tenant</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Setiap mitra hanya melihat data miliknya.</CardContent></Card>
            <Card><CardHeader><Database className="mb-3 size-8 text-primary" /><CardTitle>Data pusat</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">NIK dan UID disimpan sebagai identitas paten.</CardContent></Card>
            <Card><CardHeader><Radio className="mb-3 size-8 text-primary" /><CardTitle>API IoT</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Terminal ESP32 terhubung via bridge PC.</CardContent></Card>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold">Demo siap dijalankan.</h2>
            <p className="mt-2 text-primary-foreground/70">Akun seed: admin / mitra123.</p>
          </div>
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "secondary" })}>Masuk Dashboard</Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
        <span>© 2026 Identiva</span>
        <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> IoT + Web + Kuota</span>
      </footer>
    </main>
  );
}
