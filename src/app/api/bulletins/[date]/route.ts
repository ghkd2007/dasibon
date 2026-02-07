import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bulletins/2025-01-26
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
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
  } catch (e) {
    console.error("GET /api/bulletins/[date]", e);
    return NextResponse.json(
      { error: "주보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/bulletins/2025-01-26
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    await prisma.bulletin.delete({
      where: { date },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/bulletins/[date]", e);
    return NextResponse.json(
      { error: "삭제하지 못했습니다." },
      { status: 500 }
    );
  }
}
