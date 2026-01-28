import * as React from "react";
import { toast } from "sonner";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ProductInfoSections } from "@/components/product/ProductInfoSections";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { StoreFooter } from "@/components/product/StoreFooter";
import leggingBlack1 from "@/assets/legging-black-1.jpg";
import leggingBlack2 from "@/assets/legging-black-2.jpg";
import leggingBlack3 from "@/assets/legging-black-3.jpg";
import leggingNude from "@/assets/legging-nude.jpg";
import leggingGraphite from "@/assets/legging-graphite.jpg";
import leggingBlue from "@/assets/legging-blue.jpg";

const BRAND = "Aqua Store";

const Index = () => {
  const [color, setColor] = React.useState("black");

  const imagesByColor: Record<string, { src: string; alt: string }[]> = {
    black: [
      { src: leggingBlack1, alt: "Legging preta — foto 1" },
      { src: leggingBlack2, alt: "Legging preta — foto 2" },
      { src: leggingBlack3, alt: "Legging preta — foto 3" },
    ],
    nude: [{ src: leggingNude, alt: "Legging nude — foto 1" }],
    graphite: [{ src: leggingGraphite, alt: "Legging grafite — foto 1" }],
    blue: [{ src: leggingBlue, alt: "Legging azul — foto 1" }],
  };

  return (
    <div className="min-h-screen bg-background">
      <ProductHeader brandName={BRAND} />

      <main className="container py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-24">
            <ProductGallery
              images={imagesByColor[color] ?? imagesByColor.black}
            />
          </div>

          <div className="space-y-10">
            <ProductPurchasePanel
              name="Legging Seamless Cintura Alta — Modeladora"
              price={279.9}
              compareAtPrice={349.9}
              rating={4.7}
              reviewsCount={214}
              colors={[
                { label: "Preto", value: "black" },
                { label: "Nude", value: "nude" },
                { label: "Grafite", value: "graphite" },
                { label: "Azul", value: "blue" },
              ]}
              selectedColor={color}
              onColorChange={setColor}
              sizes={[
                { label: "P", value: "P" },
                { label: "M", value: "M" },
                { label: "G", value: "G" },
                { label: "GG", value: "GG" },
              ]}
              onBuy={({ color, size, qty }) => {
                toast.success("Pedido pronto! (demo)", {
                  description: `Cor: ${color} • Tamanho: ${size} • Qtd: ${qty}`,
                });
              }}
            />

            <ProductInfoSections
              description="Legging cintura alta com toque macio, compressão na medida e caimento que valoriza. Perfeita pra treino e dia a dia — sem transparência e com secagem rápida."
              highlights={[
                "Cintura alta (modeladora)",
                "Tecido canelado / seamless",
                "Alta elasticidade e conforto",
                "Respirável e secagem rápida",
              ]}
              specs={[
                { label: "Modelagem", value: "Cintura alta" },
                { label: "Elasticidade", value: "Alta" },
                { label: "Tecido", value: "Seamless" },
                { label: "Transparência", value: "Não" },
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
