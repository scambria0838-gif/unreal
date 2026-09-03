"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { triageFields, triageSchema } from "@/lib/triage";

type TriageFormProps = {
  focus?: string;
  city?: string;
};

export function TriageForm({ focus, city }: TriageFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo(
    () => ({
      occupancy: "residential",
      constructionStarted: "unsure",
      cityContacted: "unsure",
      redTag: focus === "red-tag" ? "yes" : "unsure",
      stopWork: focus === "red-tag" ? "unsure" : "unsure",
      plansExist: "unsure",
      permitPulled: "unsure",
      city: city ?? "",
      focus: focus ?? "",
    }),
    [city, focus],
  );

  async function onSubmit(formData: FormData) {
    setStatus("submitting");
    setError(null);

    const raw = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      occupancy: String(formData.get("occupancy") ?? "residential"),
      city: String(formData.get("city") ?? ""),
      propertyType: String(formData.get("propertyType") ?? ""),
      intent: String(formData.get("intent") ?? ""),
      constructionStarted: String(formData.get("constructionStarted") ?? "unsure"),
      cityContacted: String(formData.get("cityContacted") ?? "unsure"),
      redTag: String(formData.get("redTag") ?? "unsure"),
      stopWork: String(formData.get("stopWork") ?? "unsure"),
      plansExist: String(formData.get("plansExist") ?? "unsure"),
      permitPulled: String(formData.get("permitPulled") ?? "unsure"),
      currentContractor: String(formData.get("currentContractor") ?? ""),
      timeline: String(formData.get("timeline") ?? ""),
      focus: String(formData.get("focus") ?? ""),
      fileNotes: String(formData.get("fileNotes") ?? ""),
    };

    const parsed = triageSchema.safeParse(raw);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Check the required fields.");
      return;
    }

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        throw new Error("The review could not be sent.");
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("The form did not send. Call 602-526-2299.");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-bronze bg-paper p-8 text-ink">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze-2">Received</p>
        <h2 className="mt-4 font-display text-4xl">John has the facts.</h2>
        <p className="mt-4 text-sm leading-7 text-ink/70">
          Your project review was submitted. If this is a red tag or stop-work, do
          not wait on email. Call now.
        </p>
        <div className="mt-8">
          <Button href={site.phoneHref}>Call {site.phone}</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="grid gap-5">
      <input type="hidden" name="focus" defaultValue={defaults.focus} />
      <Field label="Your name" name="name" required />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" required />
        <Field label="Email" name="email" type="email" />
      </div>
      {triageFields.map((field) => {
        if (field.type === "select") {
          return (
            <label key={field.name} className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                {field.label}
              </span>
              <select
                name={field.name}
                defaultValue={defaults[field.name as keyof typeof defaults] ?? "unsure"}
                className="mt-2 w-full border border-paper/15 bg-ink-2 px-3 py-3 text-sm text-paper"
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        if (field.type === "textarea") {
          return (
            <label key={field.name} className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                {field.label}
              </span>
              <textarea
                name={field.name}
                required
                rows={5}
                className="mt-2 w-full border border-paper/15 bg-ink-2 px-3 py-3 text-sm text-paper"
              />
            </label>
          );
        }
        return (
          <Field
            key={field.name}
            label={field.label}
            name={field.name}
            defaultValue={field.name === "city" ? defaults.city : undefined}
          />
        );
      })}
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
          Photos, red-tag notice, plans, permit paperwork
        </span>
        <textarea
          name="fileNotes"
          rows={3}
          placeholder="Describe what you can send, or note that you will text photos to 602-526-2299."
          className="mt-2 w-full border border-paper/15 bg-ink-2 px-3 py-3 text-sm text-paper placeholder:text-concrete"
        />
        <span className="mt-2 block text-xs leading-5 text-concrete">
          File upload to cloud storage can be connected in production. For now, describe
          the documents or text them after you submit.
        </span>
      </label>
      {error ? <p className="text-sm text-hazard">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-bronze px-5 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink disabled:opacity-60"
      >
        {status === "submitting" ? "Sending review…" : "Request project review"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 w-full border border-paper/15 bg-ink-2 px-3 py-3 text-sm text-paper"
      />
    </label>
  );
}
