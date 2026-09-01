import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { EmailCapture } from "@/components/landing/EmailCapture";
import { Footer } from "@/components/landing/Footer";

const title = "Juris.Track — Nunca mais perca um prazo processual";
const description =
  "Integração com o PJe, check-lists de prazos e avisos automáticos por WhatsApp para advogados autônomos e pequenos escritórios.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Benefits />
        <EmailCapture />
      </main>
      <Footer />
    </div>
  );
}
