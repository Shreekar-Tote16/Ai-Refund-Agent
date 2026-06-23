"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setError("");
    const result = await signIn("credentials", {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      redirect: false
    });
    if (result?.error) {
      setError("Invalid admin credentials.");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/admin");
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <form action={submit} className="rounded-md border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <label className="mt-6 block text-sm font-medium">Email</label>
        <input name="email" type="email" defaultValue="admin@example.com" className="mt-1 w-full rounded-md border px-3 py-2" />
        <label className="mt-4 block text-sm font-medium">Password</label>
        <input name="password" type="password" defaultValue="password123" className="mt-1 w-full rounded-md border px-3 py-2" />
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button className="mt-6 w-full rounded-md bg-teal-700 px-4 py-2 text-white">Sign in</button>
      </form>
    </section>
  );
}
