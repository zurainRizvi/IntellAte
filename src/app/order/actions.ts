"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { orderRequestSchema, type OrderRequest } from "@/content/schema";

export type OrderActionState =
  | { ok: true; id: string }
  | { ok: false; error: string }
  | null;

export async function submitOrderRequest(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const raw = {
    source: formData.get("source") || "design",
    designSlug: formData.get("designSlug") || undefined,
    occasion: formData.get("occasion"),
    eventCount: formData.get("eventCount"),
    names: formData.get("names"),
    eventDate: formData.get("eventDate"),
    style: formData.get("style"),
    colors: formData.get("colors"),
    notes: formData.get("notes") || undefined,
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    preferredChannel: formData.get("preferredChannel"),
  };

  const parsed = orderRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  if (parsed.data.source === "design" && !parsed.data.designSlug) {
    return { ok: false, error: "Choose a design or switch to a custom request." };
  }

  const id = `ord_${Date.now().toString(36)}`;
  const payload: OrderRequest & { id: string; receivedAt: string } = {
    ...parsed.data,
    id,
    receivedAt: new Date().toISOString(),
  };

  const inboxDir = path.join(process.cwd(), ".data", "orders");
  await mkdir(inboxDir, { recursive: true });
  await writeFile(path.join(inboxDir, `${id}.json`), JSON.stringify(payload, null, 2), "utf8");

  return { ok: true, id };
}
