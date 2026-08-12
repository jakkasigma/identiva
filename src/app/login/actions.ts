"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false, // jangan biarkan NextAuth handle redirect
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Username atau password salah." };
    }
    // Error selain AuthError — bukan login gagal, lempar lagi
    throw error;
  }
  // Redirect dilakukan oleh Next.js server action — pakai path relatif, aman di semua environment
  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
