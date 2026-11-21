import { envValue } from "@/lib/runtime-env";

type RazorpayMode = "test" | "live";

type RazorpayConfig = {
  mode: RazorpayMode;
  keyId: string;
  keySecret: string;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
};

const API_BASE = "https://api.razorpay.com/v1";

export function getRazorpayConfig(): RazorpayConfig | null {
  const mode: RazorpayMode =
    String(envValue("RAZORPAY_MODE") ?? "test").toLowerCase() === "live"
      ? "live"
      : "test";
  const suffix = mode === "live" ? "LIVE" : "TEST";
  const keyId = String(envValue(`RAZORPAY_${suffix}_KEY_ID`) ?? "").trim();
  const keySecret = String(
    envValue(`RAZORPAY_${suffix}_KEY_SECRET`) ?? "",
  ).trim();

  if (!keyId || !keySecret) return null;
  return { mode, keyId, keySecret };
}

export function isRazorpayConfigured() {
  return getRazorpayConfig() !== null;
}

async function razorpayRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const config = getRazorpayConfig();
  if (!config) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_MODE and the matching key id/secret to your environment.",
    );
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { error?: { description?: string; reason?: string } })
    | null;

  if (!response.ok) {
    const message =
      data?.error?.description ??
      data?.error?.reason ??
      `Razorpay request failed (${response.status}).`;
    throw new Error(message);
  }

  return data as T;
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}) {
  return razorpayRequest<RazorpayOrder>("/orders", {
    method: "POST",
    body: {
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    },
  });
}

export async function fetchRazorpayOrder(orderId: string) {
  return razorpayRequest<RazorpayOrder>(`/orders/${orderId}`);
}

export async function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPayment>(`/payments/${paymentId}`);
}

export async function captureRazorpayPayment(
  paymentId: string,
  amount: number,
  currency: string,
) {
  return razorpayRequest<RazorpayPayment>(`/payments/${paymentId}/capture`, {
    method: "POST",
    body: { amount, currency },
  });
}

export async function verifyRazorpaySignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const config = getRazorpayConfig();
  if (!config) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_MODE and the matching key id/secret to your environment.",
    );
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(`${input.orderId}|${input.paymentId}`),
  );
  const expected = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return expected === input.signature;
}
