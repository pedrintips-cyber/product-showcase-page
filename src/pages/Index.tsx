import * as React from "react";
import { toast } from "sonner";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ProductInfoSections } from "@/components/product/ProductInfoSections";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { StoreFooter } from "@/components/product/StoreFooter";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";

const BRAND = "Aqua Store";

const Index = () => {
  const heroRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${Math.max(0, Math.min(100, x))}%`);
      el.style.setProperty("--my", `${Math.max(0, Math.min(100, y))}%`);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="min-h-screen bg-hero">
      <ProductHeader brandName={BRAND} />

      <main ref={heroRef} className="container py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-24">
            <ProductGallery
              images={[
                { src: product1, alt: "Foto do produto - imagem 1" },
                { src: product2, alt: "Foto do produto - imagem 2" },
                { src: product3, alt: "Foto do produto - imagem 3" },
              ]}
            />
          </div>

          <div className="space-y-10">
            <ProductPurchasePanel
              name="Tênis Aurora — Edição Verde-Água"
              price={279.9}
              compareAtPrice={349.9}
              rating={4.7}
              reviewsCount={214}
              colors={[
                { label: "Verde-água", value: "teal" },
                { label: "Neve", value: "snow" },
                { label: "Grafite", value: "graphite" },
              ]}
              sizes={[
                { label: "34", value: "34" },
                { label: "35", value: "35" },
                { label: "36", value: "36" },
                { label: "37", value: "37" },
                { label: "38", value: "38" },
                { label: "39", value: "39" },
                { label: "40", value: "40" },
                { label: "41", value: "41" },
              ]}
              onBuy={({ color, size, qty }) => {
                toast.success("Pedido pronto! (demo)", {
                  description: `Cor: ${color} • Tamanho: ${size} • Qtd: ${qty}`,
                });
              }}
            />

            <ProductInfoSections
              description="Um tênis premium, leve e confortável, com acabamento minimalista e materiais que respiram. Ideal pra dia a dia — com um toque de destaque no verde-água."
              highlights={[
                "Palmilha anatômica com conforto imediato",
                "Solado com excelente aderência",
                "Cabedal respirável e fácil de limpar",
                "Visual clean que combina com tudo",
              ]}
              specs={[
                { label: "Forma", value: "Normal" },
                { label: "Peso", value: "~290g" },
                { label: "Material", value: "Têxtil premium" },
                { label: "Solado", value: "Borracha" },
              ]}
            />

            <ReviewsSection
              average={4.7}
              count={214}
              reviews={[
                {
                  name: "Marina",
                  date: "há 3 dias",
                  rating: 5,
                  title: "Conforto absurdo",
                  body: "Chegou rápido, bem embalado e o tênis é muito mais bonito ao vivo. Usei o dia todo e não cansou o pé.",
                },
                {
                  name: "Rafael",
                  date: "há 1 semana",
                  rating: 4.5,
                  title: "Acabamento premium",
                  body: "Gostei bastante do material e do solado. Peguei meu tamanho normal e serviu perfeito.",
                },
                {
                  name: "Camila",
                  date: "há 2 semanas",
                  rating: 5,
                  title: "Vale o preço",
                  body: "Design clean, combina com tudo. Já quero outra cor. Recomendo!",
                },
              ]}
            />
          </div>
        </div>
      </main>

      <StoreFooter brandName={BRAND} />
    </div>
  );
};

export default Index;
