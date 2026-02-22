import { api } from "@/lib/api/client";

interface CheckoutSession {
  sessionId: string;
  url: string;
}

export async function createTemplateCheckout(payload: {
  items: { templateId: string }[];
  couponCode?: string;
}): Promise<CheckoutSession> {
  const { data } = await api.post("/checkout/template", payload);
  return data.data;
}

export async function createServiceCheckout(payload: {
  packageId: string;
  requirements?: string;
}): Promise<CheckoutSession> {
  const { data } = await api.post("/checkout/service", payload);
  return data.data;
}
