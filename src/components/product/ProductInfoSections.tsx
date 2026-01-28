import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Ruler, Sparkles } from "lucide-react";

type ProductInfoSectionsProps = {
  description: string;
  highlights: string[];
  specs: Array<{ label: string; value: string }>;
};

export function ProductInfoSections({ description, highlights, specs }: ProductInfoSectionsProps) {
  return (
    <section aria-label="Descrição" className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Badge variant="soft" className="gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Destaques
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="tabela" className="lg:pl-6 lg:border-l">
          <div className="flex items-center gap-2">
            <Badge variant="soft" className="gap-1">
              <Ruler className="h-3.5 w-3.5" /> Medidas
            </Badge>
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            {specs.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="border-t">
        <AccordionItem value="shipping" className="border-b px-0">
          <AccordionTrigger className="text-sm">Envio e prazos</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Postagem em até 24h úteis. Você recebe o código de rastreio por e-mail e pode acompanhar tudo em tempo real.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns" className="border-b px-0">
          <AccordionTrigger className="text-sm">Troca e devolução</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Troca grátis em até 7 dias após o recebimento. Sem dor de cabeça.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="warranty" className="border-b px-0">
          <AccordionTrigger className="text-sm">Garantia</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Garantia contra defeitos de fabricação. Se algo não estiver perfeito, resolvemos rápido.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
