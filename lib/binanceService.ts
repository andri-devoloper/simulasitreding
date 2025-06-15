export async function getCurrentPrice(symbol: string): Promise<number> {
  const res = await fetch(
    `https://testnet.binance.vision/api/v3/ticker/price?symbol=${symbol}`,
    {
      method: "GET",
      headers: {
        "X-MBX-APIKEY": process.env.BINANCE_API_KEY || "",
      },
      //
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch price for ${symbol}`);
  }

  const data = await res.json();
  return parseFloat(data.price);
}
