import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const config = await prisma.strategyConfig.create({
      data: {
        symbol: body.symbol,
        timeframe: body.timeframe,
        plusDI: body.plusDIThreshold,
        minusDI: body.minusDIThreshold,
        adx: body.adxMinimum,
        takeProfit: body.takeProfitPercent,
        stopLoss: body.stopLossPercent,
        leverage: body.leverage,
      },
    });

    return NextResponse.json({ message: "Config saved", data: config });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save config" },
      { status: 500 }
    );
  }
}
