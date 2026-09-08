import { notFound } from "next/navigation";
import { getLandingPageBySlug, LANDING_PAGES } from "@/lib/data/landing-pages";
import { LandingPageTemplate } from "@/components/landing/landing-page-template";

export async function generateStaticParams() {
  return LANDING_PAGES.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    return { title: "Landing Page Not Found" };
  }

  return {
    title: `${page.title} — Special Offer`,
    description: page.subtitle,
  };
}

export default async function DynamicLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pageData = getLandingPageBySlug(slug);

  if (!pageData) {
    notFound();
  }

  return <LandingPageTemplate pageData={pageData} />;
}
