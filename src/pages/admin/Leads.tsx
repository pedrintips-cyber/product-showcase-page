import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/auth/AuthProvider";

type LeadRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  product_name: string;
  product_color: string | null;
  product_size: string | null;
  qty: number;
  add_top: boolean;
  shipping: string;
  total: number;
  pix_identifier: string | null;
  sent_to_discord: boolean;
  discord_batch_id: string | null;
};

function toCsvValue(v: unknown) {
  const s = String(v ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${s}"`;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminLeadsPage() {
  const { signOut } = useAuth();
  const [limit] = React.useState(200);

  const leadsQuery = useQuery({
    queryKey: ["admin-leads", limit],
    queryFn: async (): Promise<LeadRow[]> => {
      const { data, error } = await supabase
        .from("checkout_leads")
        .select(
          "id,created_at,name,email,phone,cpf,cep,address,number,product_name,product_color,product_size,qty,add_top,shipping,total,pix_identifier,sent_to_discord,discord_batch_id",
        )
        // “Somente pago” no critério atual: só exibir leads com Pix gerado.
        .not("pix_identifier", "is", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as LeadRow[];
    },
  });

  const exportCsv = () => {
    const rows = leadsQuery.data ?? [];
    if (!rows.length) {
      toast.error("Nada para exportar");
      return;
    }

    const header = [
      "created_at",
      "id",
      "name",
      "email",
      "phone",
      "cpf",
      "cep",
      "address",
      "number",
      "product_name",
      "product_color",
      "product_size",
      "qty",
      "add_top",
      "shipping",
      "total",
      "pix_identifier",
      "sent_to_discord",
      "discord_batch_id",
    ];

    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.created_at,
          r.id,
          r.name,
          r.email,
          r.phone,
          r.cpf,
          r.cep,
          r.address,
          r.number,
          r.product_name,
          r.product_color ?? "",
          r.product_size ?? "",
          r.qty,
          r.add_top,
          r.shipping,
          r.total,
          r.pix_identifier ?? "",
          r.sent_to_discord,
          r.discord_batch_id ?? "",
        ].map(toCsvValue).join(","),
      );
    }

    downloadText(`leads-${new Date().toISOString().slice(0, 10)}.csv`, lines.join("\n"));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-balance text-2xl font-semibold tracking-tight">Leads / Checkouts</h1>
            <p className="text-sm text-muted-foreground">
              Dados sensíveis (CPF/endereço). Acesso somente admin.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => leadsQuery.refetch()}>
              Atualizar
            </Button>
            <Button type="button" variant="outline" onClick={exportCsv}>
              Exportar CSV
            </Button>
            <Button type="button" onClick={signOut}>
              Sair
            </Button>
          </div>
        </header>

        <Separator className="my-4" />

        <section aria-label="Tabela de leads" className="rounded-lg border border-border overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pix</TableHead>
                  <TableHead>Discord</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                      Carregando…
                    </TableCell>
                  </TableRow>
                )}
                {leadsQuery.isError && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-destructive">
                      Não foi possível carregar (verifique se você é admin).
                    </TableCell>
                  </TableRow>
                )}
                {!leadsQuery.isLoading && !leadsQuery.isError && (leadsQuery.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum registro ainda.
                    </TableCell>
                  </TableRow>
                )}
                {(leadsQuery.data ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="min-w-[180px]">{r.name}</TableCell>
                    <TableCell className="min-w-[220px]">{r.email}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.phone}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.cpf}</TableCell>
                    <TableCell className="min-w-[260px]">
                      {r.address} • Nº {r.number} • CEP {r.cep}
                    </TableCell>
                    <TableCell className="min-w-[240px]">
                      {r.product_name}
                      <div className="text-xs text-muted-foreground">
                        {r.product_color ? `Cor: ${r.product_color}` : ""}
                        {r.product_size ? ` • Tam: ${r.product_size}` : ""}
                        {` • Qtd: ${r.qty}`}
                        {r.add_top ? " • + Top" : ""}
                        {` • Frete: ${r.shipping}`}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">R$ {Number(r.total).toFixed(2)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.pix_identifier ? r.pix_identifier.slice(0, 8) + "…" : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.sent_to_discord ? "Enviado" : "Pendente"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
