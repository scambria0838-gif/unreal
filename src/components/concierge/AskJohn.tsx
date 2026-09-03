"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { replyTo, starterPrompts, type ConciergeMessage } from "@/lib/concierge";
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
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const next: ConciergeMessage[] = [...messages, { role: "user", content: trimmed }];
    const history = messages;
    setMessages(next);
    setValue("");
    setBusy(true);

    const local = replyTo(history, trimmed);

    try {
      const response = await fetch("/api/ask-john", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await response.json()) as { reply?: string };
      setMessages([
        ...next,
        { role: "assistant", content: data.reply ?? local.reply },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: local.reply }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-paper/10 bg-ink-2">
      <div className="border-b border-paper/10 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
          Start with one of these
        </p>
        <div className="flex flex-wrap gap-2">
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
      </div>
      <div
        className="min-h-[22rem] max-h-[32rem] space-y-4 overflow-y-auto p-5 md:p-8"
        aria-live="polite"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-auto max-w-[40rem] border border-bronze/40 bg-ink px-5 py-4"
                : "max-w-[46rem] border border-paper/10 bg-ink-3 px-5 py-4"
            }
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
              {message.role === "assistant" ? "John's desk" : "You"}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-paper">{message.content}</p>
          </div>
        ))}
        {busy ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            Reviewing the situation…
          </p>
        ) : null}
        <div ref={endRef} />
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
          placeholder="Type the city, the notice, and what you need…"
          className="flex-1 border border-paper/15 bg-ink px-3 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={busy || value.trim().length === 0}
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
