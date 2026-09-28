"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type Reply = {
  text: string;
  href?: string;
  hrefLabel?: string;
};

function replyTo(input: string): Reply {
  const q = input.toLowerCase();

  if (!q.trim()) {
    return {
      text: "Ask about pricing, single vs multi-event packages, occasions, or which design fits your story.",
    };
  }

  if (/(price|pricing|cost|pkr|budget|pay)/.test(q)) {
    return {
      text: "Catalogue designs start from the price shown on each card. You request a design first — pay after we confirm scope. Custom work is quoted after the brief.",
      href: "/invitations",
      hrefLabel: "Browse prices",
    };
  }

  if (/(single|multi|package|event card|mehndi|baraat|waleema)/.test(q)) {
    return {
      text: "Single-event cards cover one celebration. Multi-event cards are one complete invitation with 2+ events — Aurora Safar includes Mehndi, Baraat, and Waleema as separate worlds.",
      href: "/invitations?kind=multi",
      hrefLabel: "See multi-event cards",
    };
  }

  if (/(wedding|married|nikah)/.test(q)) {
    return {
      text: "Based on what you've described, Aurora Safar would be a good starting point. Want to customize it?",
      href: "/invitations/aurora-safar",
      hrefLabel: "Open Aurora Safar",
    };
  }

  if (/(birthday|ember)/.test(q)) {
    return {
      text: "For a birthday, Ember Year is a focused single-event starting point — soft peach, countdown, and RSVP — or go fully custom.",
      href: "/invitations/ember-year",
      hrefLabel: "View Ember Year",
    };
  }

  if (/(engagement|first light|first-light)/.test(q)) {
    return {
      text: "For an engagement, First Light is a soft blush single-event card with a live preview you can open and maximize.",
      href: "/invitations/first-light",
      hrefLabel: "View First Light",
    };
  }

  if (/(newborn|baby|lullaby)/.test(q)) {
    return {
      text: "For a newborn welcome, Lullaby Moon is a powder-blue single-event invitation with live preview.",
      href: "/invitations/lullaby-moon",
      hrefLabel: "View Lullaby Moon",
    };
  }

  if (/(graduation|laureate)/.test(q)) {
    return {
      text: "For graduation, Laureate Dusk uses a sage evening palette — open the live preview from the catalogue.",
      href: "/invitations/laureate-dusk",
      hrefLabel: "View Laureate Dusk",
    };
  }

  if (/(anniversary|silver)/.test(q)) {
    return {
      text: "For an anniversary dinner, Silver Thread is a champagne single-event card with countdown and RSVP.",
      href: "/invitations/silver-thread",
      hrefLabel: "View Silver Thread",
    };
  }

  if (/(custom|bespoke|unique|own|create)/.test(q)) {
    return {
      text: "Custom is our strongest path. Share the idea, occasion, style, and colours — designers refine it with you after the brief.",
      href: "/custom",
      hrefLabel: "Start a custom brief",
    };
  }

  if (/(cod|cash on delivery|payment|pay after)/.test(q)) {
    return {
      text: "There is no cash-on-delivery for digital invitations. Request the design, we confirm with you, then you pay — Order Now, Pay After Confirmation.",
      href: "/order",
      hrefLabel: "Request a design",
    };
  }

  if (/(recommend|suggest|which|demo|flagship|started)/.test(q)) {
    return {
      text: "Based on what you've described, Design Aurora Safar would be a good starting point. Want to customize it?",
      href: "/invitations/aurora-safar/preview",
      hrefLabel: "Open live preview",
    };
  }

  return {
    text: "I can help with pricing, single vs multi-event packages, recommendations, and customization. Try “wedding multi-event” or “custom design”.",
    href: "/invitations",
    hrefLabel: "Browse invitations",
  };
}

export function AiConcierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; reply: Reply }[]>([
    {
      role: "assistant",
      reply: {
        text: "I'm the IntellAte concierge. Ask about pricing, packages, or which invitation fits — then I'll point you to the right path.",
      },
    },
  ]);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);
  const hidden = pathname.includes("/preview");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const reply = replyTo(text);
    setMessages((prev) => [...prev, { role: "user", reply: { text } }, { role: "assistant", reply }]);
    setDraft("");
  };

  if (hidden) return null;

  return (
    <div className={`concierge${open ? " is-open" : ""}`}>
      {open ? (
        <section className="concierge-panel" aria-label="AI Concierge">
          <header className="concierge-header">
            <div>
              <p className="eyebrow">AI Concierge</p>
              <h2 className="concierge-title">Ask IntellAte</h2>
            </div>
            <button type="button" className="text-control" onClick={() => setOpen(false)}>
              Close
            </button>
          </header>
          <div className="concierge-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`concierge-bubble is-${message.role}`}>
                <p>{message.reply.text}</p>
                {message.reply.href ? (
                  <Link href={message.reply.href} className="text-link">
                    {message.reply.hrefLabel ?? "Continue"}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          <div className="concierge-compose">
            <label className="sr-only" htmlFor="concierge-input">
              Your question
            </label>
            <input
              id="concierge-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="e.g. wedding multi-event pricing"
            />
            <button type="button" className="btn btn-primary" disabled={!canSend} onClick={send}>
              Send
            </button>
          </div>
        </section>
      ) : (
        <button type="button" className="concierge-launcher" onClick={() => setOpen(true)}>
          Concierge
        </button>
      )}
    </div>
  );
}
