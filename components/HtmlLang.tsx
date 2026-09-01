"use client";

import { useEffect } from "react";

// The root layout renders <html lang="en">; this keeps the attribute in sync
// on the /mn and /ko routes for accessibility and SEO.
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
