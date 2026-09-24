"use server";

import { redirect } from "next/navigation";

export async function signIn(formData: { email: string; password: string }) {
  redirect("/sign-in");
}

export async function signUp(formData: {
  fullName: string; email: string; password: string; country: string; mobile?: string; address?: string;
}) {
  redirect("/sign-up");
}