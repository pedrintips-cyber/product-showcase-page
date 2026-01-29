import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copyAndPaste: string;
  qrCodeImageUrl?: string;
};

export function PixPaymentDialog({ open, onOpenChange, copyAndPaste, qrCodeImageUrl }: Props) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyAndPaste);
      toast.success("Código Pix copiado");
    } catch {
      toast.error("Não foi possível copiar automaticamente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pix gerado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {qrCodeImageUrl ? (
            <div className="flex items-center justify-center rounded-lg border border-border p-3">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={qrCodeImageUrl} alt="QR Code Pix" className="h-52 w-52" loading="lazy" />
            </div>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pix copia e cola</p>
            <Input readOnly value={copyAndPaste} className="h-12 font-mono text-xs" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCopy}>
                Copiar
              </Button>
              <Button type="button" variant="hero" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
