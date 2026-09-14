"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PriceTagPattern } from "@/components/dashboard/price-tag-pattern";
import { cn } from "@/lib/utils/cn";

type Mode = "signin" | "signup";

function authErrorMessage(message: string, mode: Mode): string {
  if (message === "Email not confirmed") {
    return "Confirma tu email antes de ingresar (revisa tu casilla de entrada).";
  }
  if (message === "Invalid login credentials") {
    return "Email o contrasena incorrectos.";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "Ya existe una cuenta con ese email. Iniciá sesión.";
  }
  return mode === "signin" ? "Email o contrasena incorrectos." : message;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(authErrorMessage(error.message, mode));
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(authErrorMessage(error.message, mode));
      return;
    }
    if (!data.session) {
      setInfo("Cuenta creada. Revisa tu email para confirmarla antes de ingresar.");
      setMode("signin");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 lg:flex">
        <PriceTagPattern />

        <p className="relative z-10 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
          Mostrador
        </p>

        <div className="relative z-10 max-w-sm">
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-primary-foreground">
            Ventas y stock,
            <br />
            en vivo.
          </h1>
          <p className="mt-4 text-sm text-primary-foreground/70">
            El panel del mostrador: quiebres de stock, reposiciones y cada
            venta, al instante.
          </p>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/40">Panel interno</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "signin"
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "signup"
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Crear cuenta
            </button>
          </div>

          <h2 className="mb-1 font-display text-2xl font-medium tracking-tight text-foreground">
            {mode === "signin" ? "Bienvenido de nuevo" : "Crear una cuenta"}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Ingresa con tu email y contrasena."
              : "Vas a poder ingresar apenas confirmes tu email."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {info ? <p className="text-xs text-success">{info}</p> : null}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <Button type="submit" disabled={loading} className="mt-2">
              {loading
                ? "Un momento..."
                : mode === "signin"
                  ? "Ingresar"
                  : "Crear cuenta"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
