"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { buildSimulatorQuery } from "@/lib/module-c/share-params";
import type { ReservoirMap } from "@/lib/module-c/transfer-math";

type ShareButtonProps = {
  pollId: string | null;
  c1: string | null;
  c2: string | null;
  matrix: string | null;
  reservoirs?: ReservoirMap;
};

/**
 * Copie l’URL du simulateur (pollId, c1, c2, matrix, r) dans le presse-papiers.
 */
export function ShareButton({
  pollId,
  c1,
  c2,
  matrix,
  reservoirs,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const q = buildSimulatorQuery({
      pollId,
      c1,
      c2,
      matrix,
      reservoirs,
    });
    const url = `${window.location.origin}/c/simulateur${q}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copier l’URL de partage :", url);
    }
  }

  return (
    <Button variant="secondary" onClick={share} aria-live="polite">
      {copied ? "Lien copié" : "Partager le scénario"}
    </Button>
  );
}
