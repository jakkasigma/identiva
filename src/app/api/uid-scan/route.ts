import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCabangByToken, unauthorized } from "@/lib/auth-api";
import { validateScanMethod } from "@/lib/scan-guard";

const requestSchema = z.object({
  token: z.string().min(1),
  uid: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const cabang = await getCabangByToken(body.token);
    if (!cabang) return unauthorized();

    const guard = await validateScanMethod(cabang.id, "alat_esp32");
    if (!guard.allowed) return Response.json({ status: "error", pesan: guard.error }, { status: 403 });

    const scan = await prisma.scanPending.create({
      data: { cabangId: cabang.id, uidKartu: body.uid },
    });

    return Response.json({
      status: "ok",
      scan_id: scan.id,
      uid: scan.uidKartu,
      waktu_scan: scan.waktuScan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ status: "error", pesan: "Payload tidak valid", detail: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return Response.json({ status: "error", pesan: "Server error" }, { status: 500 });
  }
}
