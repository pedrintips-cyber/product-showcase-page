import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";

type Props = {
  title?: string;
  items: Array<{ label: string; value: string }>;
  totalLabel?: string;
  totalValue: string;
};

export function CheckoutMobileSummaryBar({
  title = "Resumo",
  items,
  totalLabel = "Total",
  totalValue,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{totalLabel}</p>
          <p className="truncate text-sm font-semibold tracking-tight">{totalValue}</p>
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Ver resumo
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-5">
              <Separator className="mb-4" />
              <CheckoutOrderSummary title={title} items={items} />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
