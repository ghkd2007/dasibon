import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bulletins → 목록(날짜만), GET /api/bulletins?date=YYYY-MM-DD → 해당 주보 1건
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      const bulletin = await prisma.bulletin.findUnique({
        where: { date },
      });
      if (!bulletin) {
        return NextResponse.json(
          { error: "해당 날짜의 주보가 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json(bulletin);
    }

    const list = await prisma.bulletin.findMany({
      orderBy: { date: "desc" },
      select: { date: true, sermonTitleMain: true },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/bulletins", e);
    return NextResponse.json(
      { error: "주보 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/bulletins → upsert (날짜로 있으면 수정, 없으면 생성)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      time,
      sermonTitleMain,
      sermonTitleSub,
      praises,
      prayers,
      passage,
      sermonDescription,
      commitment,
      announcements,
    } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json(
        { error: "날짜(date)가 필요합니다." },
        { status: 400 }
      );
    }

    const data = {
      time: time ?? "11:00",
      sermonTitleMain: sermonTitleMain ?? "",
      sermonTitleSub: sermonTitleSub ?? "",
      praises: praises ?? "",
      prayers: prayers ?? "",
      passage: passage ?? "",
      sermonDescription: sermonDescription ?? "",
      commitment: commitment ?? "",
      announcements: announcements ?? "",
    };

    const bulletin = await prisma.bulletin.upsert({
      where: { date },
      create: { date, ...data },
      update: data,
    });
    return NextResponse.json(bulletin);
  } catch (e) {
    console.error("POST /api/bulletins", e);
    return NextResponse.json(
      { error: "저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
