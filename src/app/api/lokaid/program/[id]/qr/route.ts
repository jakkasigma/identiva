import { randomBytes } from "crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateScanMethod } from "@/lib/scan-guard";

const schema = z.object({ cabang_id: z.coerce.number().int().positive().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.mitraId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const programId = Number(id);
  const body = schema.parse(await request.json().catch(() => ({})));

  const program = await prisma.programLokaID.findFirst({
    where: { id: programId, mitraId: session.user.mitraId },
    select: { id: true, nama: true, cabangId: true },
  });
  if (!program) return Response.json({ error: "Program tidak ditemukan" }, { status: 404 });

  const cabangId = session.user.role === "admin_cabang"
    ? session.user.cabangId
    : body.cabang_id ?? program.cabangId;
  if (!cabangId) return Response.json({ error: "Pilih wilayah/cabang untuk QR program induk" }, { status: 400 });

  const guard = await validateScanMethod(cabangId, "hp_nfc");
  if (!guard.allowed) return Response.json({ error: guard.error }, { status: 403 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const qr = await prisma.qRToken.create({
    data: {
      token,
      programId,
      cabangId,
      expiresAt,
      createdBy: Number(session.user.id),
    },
  });

  const url = new URL(request.url);
  const scanUrl = `${url.origin}/scan/${qr.token}`;
  return Response.json({ status: "ok", token: qr.token, scan_url: scanUrl, expires_at: qr.expiresAt });
}
