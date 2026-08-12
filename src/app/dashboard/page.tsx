import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Router halaman dashboard — arahkan ke halaman ringkasan yang sesuai per tipeMitra
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.mitraId) redirect("/login");

  const mitra = await prisma.mitra.findUnique({
    where: { id: session.user.mitraId },
    select: { tipeMitra: true },
  });

  if (mitra?.tipeMitra === "lokaid") {
    redirect("/dashboard/lokaid");
  }

  // Default: SPBU Pertamina (subsidi)
  redirect("/dashboard/spbu");
}
