import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/review" },
};

export default function ContactPage() {
  redirect("/review");
}
