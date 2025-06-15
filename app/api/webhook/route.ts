// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPrice } from "@/lib/binanceService";

type Signal = {
  plusDI: number;
  minusDI: number;
  adx: number;
  symbol?: string;
};

const defaultConfig = {
  plusDI: 20,
  minusDI: 20,
  adx: 25,
  symbol: "BTCUSDT",
  takeProfit: 2,
  stopLoss: 1,
  leverage: "10x",
  timeframe: "5m",
};

export async function POST(req: NextRequest) {
  const signal: Signal = await req.json();

  const config = await prisma.strategyConfig.findFirst({
    orderBy: { id: "desc" },
  });

  const threshold = config ?? defaultConfig;

  let action: "BUY" | "SELL" | null = null;

  if (
    signal.plusDI > threshold.plusDI &&
    signal.minusDI < threshold.minusDI &&
    signal.adx > threshold.adx
  ) {
    action = "BUY";
  } else if (
    signal.plusDI < threshold.plusDI &&
    signal.minusDI > threshold.minusDI &&
    signal.adx > threshold.adx
  ) {
    action = "SELL";
  }

  if (!action) {
    return NextResponse.json(
      { message: "Invalid signal, no action taken." },
      { status: 400 }
    );
  }

  try {
    const price_entry = await getCurrentPrice(
      signal.symbol || threshold.symbol
    );
    const tp = price_entry * (1 + threshold.takeProfit / 100);
    const sl = price_entry * (1 - threshold.stopLoss / 100);

    const order = await prisma.order.create({
      data: {
        symbol: threshold.symbol,
        action,
        price_entry: parseFloat(price_entry.toFixed(2)),
        tp_price: parseFloat(tp.toFixed(2)),
        sl_price: parseFloat(sl.toFixed(2)),
        leverage: threshold.leverage,
        timeframe: threshold.timeframe,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ message: "Order simulated and saved", order });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save order to database." },
      { status: 500 }
    );
  }
}
