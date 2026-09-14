import { createClient } from "@/lib/supabase/server";
import { NavTabs } from "@/components/dashboard/nav-tabs";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-display text-lg font-medium tracking-tight text-foreground">
              Mostrador
            </span>
            <NavTabs />
          </div>
          <div className="flex items-center gap-3">
            {user?.email ? (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            ) : null}
            <SignOutButton />
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
