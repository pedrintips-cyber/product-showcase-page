import * as React from "react";
import QRCode from "qrcode";

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
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = React.useState<string | null>(null);
  const qrToShow = qrCodeImageUrl || generatedQrDataUrl || undefined;

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      setGeneratedQrDataUrl(null);

      // If the backend already provided an URL, no need to generate.
      if (!open || !copyAndPaste || qrCodeImageUrl) return;

      try {
        const dataUrl = await QRCode.toDataURL(copyAndPaste, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 320,
        });

        if (!cancelled) setGeneratedQrDataUrl(dataUrl);
      } catch {
        // Silent fail: still show copy-and-paste.
        if (!cancelled) setGeneratedQrDataUrl(null);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [open, copyAndPaste, qrCodeImageUrl]);

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
          {qrToShow ? (
            <div className="flex items-center justify-center rounded-lg border border-border p-3">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={qrToShow} alt="QR Code Pix" className="h-52 w-52" loading="lazy" />
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
