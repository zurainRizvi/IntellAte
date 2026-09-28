"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitOrderRequest, type OrderActionState } from "./actions";
import type { Design, Occasion } from "@/content/schema";

const initialState: OrderActionState = null;

export function OrderForm({
  designs,
  occasions,
  defaultDesignSlug,
  defaultOccasion,
  source = "design",
}: {
  designs: Design[];
  occasions: Occasion[];
  defaultDesignSlug?: string;
  defaultOccasion?: string;
  source?: "design" | "custom";
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitOrderRequest, initialState);

  useEffect(() => {
    if (state?.ok) {
      router.push(`/order/confirmation?id=${encodeURIComponent(state.id)}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="order-form">
      <input type="hidden" name="source" value={source} />

      {source === "design" ? (
        <label className="field">
          <span>Design</span>
          <select name="designSlug" defaultValue={defaultDesignSlug ?? designs[0]?.slug} required>
            {designs.map((design) => (
              <option key={design.slug} value={design.slug}>
                {design.title} ({design.kind === "multi" ? "multi-event" : "single-event"})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="field">
        <span>Occasion</span>
        <select name="occasion" defaultValue={defaultOccasion ?? "wedding"} required>
          {occasions.map((occasion) => (
            <option key={occasion.slug} value={occasion.slug}>
              {occasion.title}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Number of events</span>
        <input name="eventCount" type="number" min={1} max={12} defaultValue={source === "custom" ? 1 : 3} required />
      </label>

      <label className="field">
        <span>Names / hosts</span>
        <input name="names" type="text" placeholder="e.g. Ayaan & Zara" required />
      </label>

      <label className="field">
        <span>Date or date range</span>
        <input name="eventDate" type="text" placeholder="e.g. 12–14 January 2027" required />
      </label>

      <label className="field">
        <span>Style</span>
        <input name="style" type="text" placeholder="e.g. cinematic, botanical, minimal futuristic" required />
      </label>

      <label className="field">
        <span>Colours</span>
        <input name="colors" type="text" placeholder="e.g. ivory, deep green, soft gold" required />
      </label>

      <label className="field">
        <span>Notes / references</span>
        <textarea name="notes" rows={4} placeholder="Describe the feeling, upload references later via WhatsApp, or list must-have moments." />
      </label>

      <label className="field">
        <span>Your name</span>
        <input name="contactName" type="text" required />
      </label>

      <label className="field">
        <span>Email</span>
        <input name="contactEmail" type="email" required />
      </label>

      <label className="field">
        <span>Phone / WhatsApp</span>
        <input name="contactPhone" type="tel" required />
      </label>

      <fieldset className="field">
        <legend>Preferred follow-up</legend>
        <label className="radio-row">
          <input type="radio" name="preferredChannel" value="whatsapp" defaultChecked />
          WhatsApp
        </label>
        <label className="radio-row">
          <input type="radio" name="preferredChannel" value="email" />
          Email
        </label>
      </fieldset>

      {state && !state.ok ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Submitting…" : source === "custom" ? "Submit custom brief" : "Request This Design"}
      </button>
      <p className="fine-print">Order now — pay after confirmation. No payment is taken on this form.</p>
    </form>
  );
}
