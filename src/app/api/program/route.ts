import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  id: z.coerce.number().int().positive().optional(),
  nama: z.string().min(2),
  bersubsidi: z.boolean(),
  diskon: z.coerce.number().int().min(0).max(100),
  periode_reset: z.enum(["harian", "mingguan", "bulanan"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const programs = await prisma.programSubsidi.findMany({
    where: { mitraId: session.user.mitraId },
    orderBy: { nama: "asc" },
  });

  return Response.json({ programs });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = schema.parse(await request.json());

    const data = {
      nama: body.nama,
      bersubsidi: body.bersubsidi,
      diskon: body.bersubsidi ? body.diskon : 0,
      periodeReset: body.periode_reset,
      mitraId: session.user.mitraId,
    };

    const program = body.id
      ? await prisma.programSubsidi.update({
          where: { id: body.id, mitraId: session.user.mitraId },
          data,
        })
      : await prisma.programSubsidi.create({ data });

    return Response.json({ status: "ok", program });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Data tidak valid", detail: error.flatten() }, { status: 400 });
    console.error(error);
    return Response.json({ error: "Gagal menyimpan program" }, { status: 500 });
  }
}
