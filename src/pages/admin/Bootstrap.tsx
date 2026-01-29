import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";

export default function AdminBootstrapPage() {
  const { refreshAdmin, isAdmin, signOut } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState<boolean | null>(null);

  const promote = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-bootstrap", {
        body: {},
      });
      if (error) throw new Error(error.message);

      const payload = (data as any)?.data ?? data;
      if (payload?.already_initialized) {
        setInitialized(true);
        toast.error("Já existe um admin configurado");
        return;
      }

      toast.success("Admin configurado", { description: "Seu usuário agora é o admin do sistema." });
      setInitialized(true);
      await refreshAdmin();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro inesperado";
      toast.error("Não foi possível configurar admin", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Bootstrap do Admin</h1>
          <p className="text-sm text-muted-foreground">
            Segurança: só o <strong>primeiro</strong> usuário que rodar isso vira admin (e o banco impede existir 2 admins).
          </p>
        </header>

        <Separator className="my-6" />

        <section className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm">
              Status: {isAdmin ? "Você já é admin." : initialized ? "Já inicializado (sem acesso)." : "Não inicializado."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Se você já vê o painel em <code>/admin/leads</code>, não precisa fazer nada.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={promote} disabled={loading || isAdmin}>
              {loading ? "Configurando..." : isAdmin ? "Você já é admin" : "Tornar este usuário o admin"}
            </Button>
            <Button type="button" variant="outline" onClick={signOut}>
              Sair
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
