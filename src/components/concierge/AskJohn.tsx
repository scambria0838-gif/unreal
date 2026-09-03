"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { starterPrompts, type ConciergeMessage } from "@/lib/concierge";
import { site } from "@/lib/site";

export function AskJohn() {
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      role: "assistant",
      content:
        "Describe the property and the problem in plain language. I will name the likely path and tell you when to get John on the phone. I am not a building official. I cannot promise a permit or a lifted tag.",
    },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: ConciergeMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setValue("");
    setBusy(true);
    try {
      const response = await fetch("/api/ask-john", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await response.json()) as { reply?: string };
      setMessages([
        ...next,
        {
          role: "assistant",
          content: data.reply ?? "Call 602-526-2299. The concierge could not finish that reply.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "The concierge is offline. Call 602-526-2299 or use the project review form.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-paper/10 bg-ink-2">
      <div className="flex flex-wrap gap-2 border-b border-paper/10 p-4">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void send(prompt)}
            className="border border-paper/15 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-steel hover:border-bronze hover:text-bronze"
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="space-y-5 p-5 md:p-8" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "md:pl-16" : ""}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
              {message.role === "assistant" ? "John's desk" : "You"}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-paper/90">{message.content}</p>
          </div>
        ))}
      </div>
      <form
        className="flex flex-col gap-3 border-t border-paper/10 p-4 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void send(value);
        }}
      >
        <label className="sr-only" htmlFor="ask-john">
          Describe your project
        </label>
        <input
          id="ask-john"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="The city red-tagged my addition…"
          className="flex-1 border border-paper/15 bg-ink px-3 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-bronze px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink disabled:opacity-60"
        >
          {busy ? "Thinking…" : "Send"}
        </button>
      </form>
      <div className="flex flex-col gap-3 border-t border-paper/10 p-4 sm:flex-row">
        <Button href="/review" className="flex-1">
          Request project review
        </Button>
        <Button href={site.phoneHref} variant="ghost" className="flex-1">
          Call {site.phone}
        </Button>
        <Button href={site.smsHref} variant="ghost" className="flex-1">
          Text John
        </Button>
      </div>
    </div>
  );
}
