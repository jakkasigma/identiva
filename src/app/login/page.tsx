import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-primary">Identiva</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-foreground">
            Masuk Mitra
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola warga, program subsidi, dan rekap transaksi.
          </p>
        </div>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Login Dashboard</CardTitle>
            <CardDescription>Gunakan akun seed: admin / mitra123.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
