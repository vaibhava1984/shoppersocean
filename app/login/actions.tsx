"use server";

import { redirect } from "next/navigation";

export async function signIn() { redirect("/sign-in"); }
export async function signUp() { redirect("/sign-up"); }
