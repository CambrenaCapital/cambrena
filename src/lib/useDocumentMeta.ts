import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description?: string;
  image?: string;
}

/**
 * Lightweight, dependency-free per-route metadata. Sets document.title and
 * updates the existing description / Open Graph / Twitter meta tags (mirroring
 * the tags declared in index.html), restoring the originals on unmount.
 */
export function useDocumentMeta({ title, description, image }: DocumentMeta) {
  useEffect(() => {
    const restore: Array<() => void> = [];

    const prevTitle = document.title;
    document.title = title;
    restore.push(() => {
      document.title = prevTitle;
    });

    const tags: Array<[attr: "name" | "property", key: string, value?: string]> = [
      ["name", "description", description],
      ["property", "og:title", title],
      ["property", "og:description", description],
      ["property", "og:image", image],
      ["name", "twitter:title", title],
      ["name", "twitter:description", description],
      ["name", "twitter:image", image],
    ];

    for (const [attr, key, value] of tags) {
      if (value == null) continue;
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      const created = !el;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", value);
      restore.push(() => {
        if (created) el.remove();
        else if (prev != null) el.setAttribute("content", prev);
      });
    }

    return () => restore.forEach((fn) => fn());
  }, [title, description, image]);
}
