import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProgramForm } from "@/components/program/ProgramForm";

export default async function ProgramPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  // Guard: hanya untuk SPBU
  const mitra = await prisma.mitra.findUnique({ where: { id: session.user.mitraId }, select: { tipeMitra: true } });
  if (mitra?.tipeMitra === "lokaid") redirect("/dashboard/lokaid");

  const programs = await prisma.programSubsidi.findMany({
    where: { mitraId: session.user.mitraId },
    orderBy: { nama: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-primary">Konfigurasi</p>
          <h1 className="font-display text-4xl font-semibold">Program Subsidi</h1>
          <p className="mt-2 text-muted-foreground">Atur produk bersubsidi, diskon, dan periode reset saldo.</p>
        </div>
        <Dialog>
          <DialogTrigger render={<Button />}>Tambah Program</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Program</DialogTitle>
            </DialogHeader>
            <ProgramForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program</CardTitle>
          <CardDescription>Diskon dihitung server-side saat alat validasi transaksi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Bersubsidi</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Reset Saldo</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.nama}</TableCell>
                  <TableCell>
                    <Badge variant={program.bersubsidi ? "secondary" : "outline"}>
                      {program.bersubsidi ? "Ya" : "Tidak"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {program.bersubsidi ? <Badge>{program.diskon}%</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{program.periodeReset}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit {program.nama}</DialogTitle>
                        </DialogHeader>
                        <ProgramForm program={program} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
