import { useEffect } from "react";
import { applySeo } from "../lib/seo";

/**
 * Set the document title, description, canonical URL and social tags for a
 * route. Runs on mount and whenever the inputs change.
 *
 * Authenticated screens should pass `noindex: true` — see applySeo().
 */
export default function useSeo({ title, description, path, noindex }) {
  useEffect(() => {
    applySeo({ title, description, path, noindex });
  }, [title, description, path, noindex]);
}
