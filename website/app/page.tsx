import { SiteHeader } from "@/components/site-header";
import { MarketingContent } from "@/components/marketing-content";
import { SmoothScroll } from "@/components/smooth-scroll";
import { PageTransition } from "@/components/page-transition";
import "@/styles/marketing.css";
import "@/styles/marketing-theme.css";
import "@/styles/workflow-tiles.css";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <PageTransition>
        <MarketingContent />
      </PageTransition>
      <SmoothScroll />
    </>
  );
}
