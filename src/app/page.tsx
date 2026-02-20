import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const dateParam = typeof params?.date === "string" ? params.date : null;

  let bulletin: { sermonTitleMain: string; sermonTitleSub: string; ogImageUrl: string | null; date: string; eventType: string } | null = null;

  try {
    if (dateParam) {
      bulletin = await prisma.bulletin.findUnique({
        where: { date: dateParam },
        select: { sermonTitleMain: true, sermonTitleSub: true, ogImageUrl: true, date: true, eventType: true },
      });
    }
    if (!bulletin) {
      const latest = await prisma.bulletin.findFirst({
        orderBy: { date: "desc" },
        select: { sermonTitleMain: true, sermonTitleSub: true, ogImageUrl: true, date: true, eventType: true },
      });
      bulletin = latest;
    }
  } catch {
    // ignore
  }

  const baseUrl = getBaseUrl();
  const title = bulletin?.sermonTitleMain?.trim() ? `${bulletin.sermonTitleMain} | 다시본교회 주보` : "다시본교회 주보 | DASIBON Worship";
  const description = bulletin?.sermonTitleSub?.trim() || bulletin?.sermonTitleMain?.trim() || "다시본교회 모바일 주보";
  const ogImage = bulletin?.ogImageUrl?.trim() ? (bulletin.ogImageUrl.startsWith("http") ? bulletin.ogImageUrl : `${baseUrl}${bulletin.ogImageUrl.startsWith("/") ? "" : "/"}${bulletin.ogImageUrl}`) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: baseUrl + (dateParam ? `?date=${encodeURIComponent(dateParam)}` : ""),
      siteName: "다시본교회 주보",
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default function Home() {
  return <HomeClient />;
}
