import { z } from "zod";

export const triageSchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  phone: z.string().min(7, "Phone is required").max(30),
  email: z.string().email().optional().or(z.literal("")),
  occupancy: z.enum(["residential", "commercial"]),
  city: z.string().min(2, "City is required").max(80),
  propertyType: z.string().max(80).optional().or(z.literal("")),
  intent: z.string().min(8, "Tell John what you are trying to do").max(2000),
  constructionStarted: z.enum(["yes", "no", "unsure"]),
  cityContacted: z.enum(["yes", "no", "unsure"]),
  redTag: z.enum(["yes", "no", "unsure"]),
  stopWork: z.enum(["yes", "no", "unsure"]),
  plansExist: z.enum(["yes", "no", "unsure"]),
  permitPulled: z.enum(["yes", "no", "unsure"]),
  currentContractor: z.string().max(200).optional().or(z.literal("")),
  timeline: z.string().max(200).optional().or(z.literal("")),
  focus: z.string().max(40).optional().or(z.literal("")),
  fileNotes: z.string().max(1000).optional().or(z.literal("")),
});

export type TriageInput = z.infer<typeof triageSchema>;

export const triageFields = [
  { name: "occupancy", label: "Residential or commercial?", type: "select", options: ["residential", "commercial"] },
  { name: "city", label: "City / municipality", type: "text" },
  { name: "propertyType", label: "Property type", type: "text" },
  { name: "intent", label: "What are you trying to do?", type: "textarea" },
  { name: "constructionStarted", label: "Has construction started?", type: "select", options: ["yes", "no", "unsure"] },
  { name: "cityContacted", label: "Has the city contacted you?", type: "select", options: ["yes", "no", "unsure"] },
  { name: "redTag", label: "Red tag?", type: "select", options: ["yes", "no", "unsure"] },
  { name: "stopWork", label: "Stop-work order?", type: "select", options: ["yes", "no", "unsure"] },
  { name: "plansExist", label: "Do plans exist?", type: "select", options: ["yes", "no", "unsure"] },
  { name: "permitPulled", label: "Permit pulled?", type: "select", options: ["yes", "no", "unsure"] },
  { name: "currentContractor", label: "Current contractor", type: "text" },
  { name: "timeline", label: "Desired timeline", type: "text" },
] as const;
