"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserCog, KeyRound, UserX, UserCheck, Plus } from "lucide-react";

type Operator = {
  id: number;
  username: string;
  aktif: boolean; // cabangId !== null
};

type Props = {
  wilayahId: number;
  operator: Operator | null;
};

// ─── Form Reset Password ──────────────────────────────────
function ResetPasswordDialog({ wilayahId, onDone }: { wilayahId: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const konfirmasi = fd.get("konfirmasi") as string;
    if (password !== konfirmasi) { setError("Password tidak cocok."); return; }

    setPending(true);
    setError(null);
    const res = await fetch(`/api/lokaid/wilayah/${wilayahId}/operator`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksi: "reset_password", password }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Gagal reset password.");
      return;
    }
    setOpen(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <KeyRound className="size-3.5 mr-1" />Reset Password
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Reset Password Operator</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label>Password Baru *</Label>
            <Input name="password" type="password" required minLength={6} placeholder="Min. 6 karakter" />
          </div>
          <div className="space-y-1">
            <Label>Konfirmasi Password *</Label>
            <Input name="konfirmasi" type="password" required placeholder="Ulangi password" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Menyimpan..." : "Reset Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Form Buat Akun Baru ─────────────────────────────────
function BuatAkunDialog({ wilayahId, onDone }: { wilayahId: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const res = await fetch(`/api/lokaid/wilayah/${wilayahId}/operator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error ?? "Gagal membuat akun.");
      return;
    }
    setOpen(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-3.5 mr-1" />Buat Akun Operator
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Buat Akun Operator Wilayah</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label>Username *</Label>
            <Input name="username" required minLength={3} placeholder="sukasari" className="font-mono" />
          </div>
          <div className="space-y-1">
            <Label>Password *</Label>
            <Input name="password" type="password" required minLength={6} placeholder="Min. 6 karakter" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Membuat..." : "Buat Akun"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Panel ──────────────────────────────────────────
export function OperatorWilayahPanel({ wilayahId, operator }: Props) {
  const router = useRouter();
  const [pendingToggle, setPendingToggle] = useState(false);

  async function toggleAktif() {
    setPendingToggle(true);
    await fetch(`/api/lokaid/wilayah/${wilayahId}/operator`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksi: "toggle_aktif" }),
    });
    setPendingToggle(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCog className="size-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Akun Operator Wilayah</CardTitle>
            <CardDescription>Admin yang mengelola program dan peserta di wilayah ini.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {operator ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <UserCog className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono font-medium">{operator.username}</p>
                <p className="text-xs text-muted-foreground">admin wilayah</p>
              </div>
              <Badge variant={operator.aktif ? "secondary" : "outline"}>
                {operator.aktif ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <ResetPasswordDialog wilayahId={wilayahId} onDone={() => router.refresh()} />
              <Button
                variant="outline"
                size="sm"
                disabled={pendingToggle}
                onClick={toggleAktif}
              >
                {operator.aktif
                  ? <><UserX className="size-3.5 mr-1" />Nonaktifkan</>
                  : <><UserCheck className="size-3.5 mr-1" />Aktifkan</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground italic">
              Belum ada akun operator untuk wilayah ini.
            </p>
            <BuatAkunDialog wilayahId={wilayahId} onDone={() => router.refresh()} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
