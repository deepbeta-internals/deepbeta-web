import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getDict } from "@/lib/i18n";

const t = getDict("ko");

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function HomeKo() {
  return <HomePage lang="ko" />;
}
