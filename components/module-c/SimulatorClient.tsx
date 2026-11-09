"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SourceBadge } from "@/components/source/SourceBadge";
import { Button } from "@/components/ui/Button";

import { toNumber } from "@/lib/module-c/format";
import { buildSimulatorQuery } from "@/lib/module-c/share-params";
import {
  normalizeTriplet,
  simulateSecondRound,
  type FirstRoundShare,
  type ReservoirMap,
  type TransferTriplet,
} from "@/lib/module-c/transfer-math";

import { ExpressedScoreGauge } from "./ExpressedScoreGauge";
import { ShareButton } from "./ShareButton";
import { TransferSliders } from "./TransferSliders";

export type SimulatorPollOption = {
  id: string;
  slug: string;
  title: string;
  institute: string;
  fieldworkEnd: string;
  isTestStructure: boolean;
  results: {
    candidateId: string | null;
    label: string | null;
    percent: number;
    candidateName: string | null;
  }[];
};

export type SimulatorMatrixOption = {
  id: string;
  slug: string;
  label: string;
  electionYear: number | null;
  origin: string;
  finalistAId: string | null;
  finalistBId: string | null;
  source?: { label: string; url: string; organism?: string | null } | null;
  /** fromCandidateId → triplet */
  reservoirs: ReservoirMap;
};

type CandidateOpt = { id: string; displayName: string };

type SimulatorClientProps = {
  polls: SimulatorPollOption[];
  matrices: SimulatorMatrixOption[];
  candidates: CandidateOpt[];
  initial: {
    pollId: string | null;
    c1: string | null;
    c2: string | null;
    matrix: string | null;
    reservoirs: ReservoirMap;
  };
};

function emptyTriplet(): TransferTriplet {
  return { toA: 33.3, toB: 33.3, toAbstention: 33.4 };
}

/**
 * Simulateur 2ᵉ tour — sondage + finalistes + matrice (2017/2022/custom).
 * Restaure l’état depuis les query params ; ShareButton ré-encode.
 */
export function SimulatorClient({
  polls,
  matrices,
  candidates,
  initial,
}: SimulatorClientProps) {
  const router = useRouter();

  const [pollId, setPollId] = useState(
    initial.pollId ?? polls[0]?.id ?? "",
  );
  const [c1, setC1] = useState(initial.c1 ?? "");
  const [c2, setC2] = useState(initial.c2 ?? "");
  const [matrixKey, setMatrixKey] = useState(
    initial.matrix ?? matrices[0]?.slug ?? "custom",
  );
  const [reservoirs, setReservoirs] = useState<ReservoirMap>(
    initial.reservoirs,
  );

  const poll = polls.find((p) => p.id === pollId) ?? polls[0];
  const selectedMatrix =
    matrixKey === "custom"
      ? null
      : matrices.find((m) => m.slug === matrixKey || m.id === matrixKey);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of candidates) map.set(c.id, c.displayName);
    if (poll) {
      for (const r of poll.results) {
        if (r.candidateId && r.candidateName)
          map.set(r.candidateId, r.candidateName);
      }
    }
    return map;
  }, [candidates, poll]);

  const shares: FirstRoundShare[] = useMemo(() => {
    if (!poll) return [];
    return poll.results
      .filter((r) => r.candidateId)
      .map((r) => ({
        candidateId: r.candidateId as string,
        percent: r.percent,
        label: r.candidateName ?? r.label ?? r.candidateId ?? "",
      }));
  }, [poll]);

  const eliminated = useMemo(() => {
    if (!c1 || !c2) return [];
    return shares.filter(
      (s) => s.candidateId !== c1 && s.candidateId !== c2,
    );
  }, [shares, c1, c2]);

  // Appliquer matrice préconfigurée quand sélectionnée
  useEffect(() => {
    if (!selectedMatrix || !c1 || !c2) return;
    // Remap matrix reservoirs : clés = fromCandidate ; destinations = finalistes matrice
    // Si les finalistes UI correspondent aux finalistes matrice, utiliser tel quel.
    // Sinon, mapper finalistA→c1, finalistB→c2.
    const src = selectedMatrix.reservoirs;
    const mapped: ReservoirMap = {};
    const aIsA = selectedMatrix.finalistAId === c1;
    const aIsB = selectedMatrix.finalistAId === c2;

    for (const [fromId, trip] of Object.entries(src)) {
      if (aIsA || (!selectedMatrix.finalistAId && !selectedMatrix.finalistBId)) {
        mapped[fromId] = normalizeTriplet(trip);
      } else if (aIsB) {
        mapped[fromId] = normalizeTriplet({
          toA: trip.toB,
          toB: trip.toA,
          toAbstention: trip.toAbstention,
        });
      } else {
        // Finalistes UI ≠ duel documenté : on garde les % mais labels A/B = UI
        mapped[fromId] = normalizeTriplet(trip);
      }
    }
    setReservoirs(mapped);
  }, [selectedMatrix, c1, c2]);

  // Init reservoirs custom pour électorats éliminés manquants
  useEffect(() => {
    if (matrixKey !== "custom" || !c1 || !c2) return;
    setReservoirs((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const e of eliminated) {
        if (!next[e.candidateId]) {
          next[e.candidateId] = emptyTriplet();
          changed = true;
        }
      }
      // Fidélité finalistes si absente
      if (!next[c1]) {
        next[c1] = { toA: 95, toB: 2, toAbstention: 3 };
        changed = true;
      }
      if (!next[c2]) {
        next[c2] = { toA: 2, toB: 95, toAbstention: 3 };
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [matrixKey, eliminated, c1, c2]);

  const labelA = nameById.get(c1) ?? "Finaliste A";
  const labelB = nameById.get(c2) ?? "Finaliste B";

  const result = useMemo(() => {
    if (!c1 || !c2 || shares.length === 0) {
      return {
        scoreA: 0,
        scoreB: 0,
        abstentionBlanc: 0,
        expressedA: 0,
        expressedB: 0,
      };
    }
    return simulateSecondRound({
      shares,
      finalistAId: c1,
      finalistBId: c2,
      reservoirs,
    });
  }, [shares, c1, c2, reservoirs]);

  function syncUrl(next: {
    pollId?: string;
    c1?: string;
    c2?: string;
    matrix?: string;
    reservoirs?: ReservoirMap;
  }) {
    const q = buildSimulatorQuery({
      pollId: next.pollId ?? pollId,
      c1: next.c1 ?? c1,
      c2: next.c2 ?? c2,
      matrix: next.matrix ?? matrixKey,
      reservoirs: next.reservoirs ?? reservoirs,
    });
    router.replace(`/sondages/simulateur${q}`, { scroll: false });
  }

  const pollCandidates = shares.map((s) => ({
    id: s.candidateId,
    name: s.label,
    percent: s.percent,
  }));

  return (
    <div className="space-y-8">
      {poll?.isTestStructure ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Sondage de test sélectionné — chiffres fictifs pour démontrer la
          structure Commission des sondages, pas des intentions 2027
          officielles.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1 text-sm sm:col-span-2">
          <span className="text-veote-muted">Sondage 1er tour</span>
          <select
            className="w-full rounded-md border border-veote-border bg-veote-card px-3 py-2 text-veote-text"
            value={pollId}
            onChange={(e) => {
              setPollId(e.target.value);
              syncUrl({ pollId: e.target.value });
            }}
          >
            {polls.map((p) => (
              <option key={p.id} value={p.id}>
                {p.isTestStructure ? "[TEST] " : ""}
                {p.institute} — {p.title.slice(0, 72)}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-veote-muted">Finaliste A</span>
          <select
            className="w-full rounded-md border border-veote-border bg-veote-card px-3 py-2 text-veote-text"
            value={c1}
            onChange={(e) => {
              setC1(e.target.value);
              syncUrl({ c1: e.target.value });
            }}
          >
            <option value="">— Choisir —</option>
            {pollCandidates.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === c2}>
                {c.name} ({c.percent.toFixed(1)} %)
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-veote-muted">Finaliste B</span>
          <select
            className="w-full rounded-md border border-veote-border bg-veote-card px-3 py-2 text-veote-text"
            value={c2}
            onChange={(e) => {
              setC2(e.target.value);
              syncUrl({ c2: e.target.value });
            }}
          >
            <option value="">— Choisir —</option>
            {pollCandidates.map((c) => (
              <option key={c.id} value={c.id} disabled={c.id === c1}>
                {c.name} ({c.percent.toFixed(1)} %)
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-veote-text">Matrice de report</p>
        <div className="flex flex-wrap gap-2">
          {matrices.map((m) => (
            <Button
              key={m.id}
              variant={
                matrixKey === m.slug || matrixKey === m.id
                  ? "primary"
                  : "secondary"
              }
              onClick={() => {
                setMatrixKey(m.slug);
                syncUrl({ matrix: m.slug });
              }}
            >
              {m.electionYear ?? "Édito"} — {m.label.replace(/^Reports /, "")}
            </Button>
          ))}
          <Button
            variant={matrixKey === "custom" ? "primary" : "secondary"}
            onClick={() => {
              setMatrixKey("custom");
              syncUrl({ matrix: "custom" });
            }}
          >
            Personnalisé
          </Button>
        </div>
        {selectedMatrix?.source ? (
          <SourceBadge
            label={selectedMatrix.source.label}
            href={selectedMatrix.source.url}
            organism={selectedMatrix.source.organism ?? undefined}
          />
        ) : matrixKey === "custom" ? (
          <p className="text-sm text-veote-muted">
            Mode libre : ajustez les 3 curseurs par électorat éliminé (somme
            verrouillée à 100&nbsp;%).
          </p>
        ) : null}
      </div>

      {c1 && c2 ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {eliminated.map((e) => (
              <TransferSliders
                key={e.candidateId}
                fromLabel={`${e.label} (${e.percent.toFixed(1)} %)`}
                finalistALabel={labelA}
                finalistBLabel={labelB}
                value={
                  reservoirs[e.candidateId] ?? emptyTriplet()
                }
                disabled={matrixKey !== "custom"}
                onChange={(next) => {
                  const updated = {
                    ...reservoirs,
                    [e.candidateId]: next,
                  };
                  setReservoirs(updated);
                  if (matrixKey === "custom") {
                    syncUrl({ matrix: "custom", reservoirs: updated });
                  }
                }}
              />
            ))}
          </div>

          <details className="text-sm text-veote-muted">
            <summary className="cursor-pointer text-veote-text">
              Fidélité des finalistes (avancé)
            </summary>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              {[c1, c2].map((id) => (
                <TransferSliders
                  key={id}
                  fromLabel={nameById.get(id) ?? id}
                  finalistALabel={labelA}
                  finalistBLabel={labelB}
                  value={
                    reservoirs[id] ??
                    (id === c1
                      ? { toA: 95, toB: 2, toAbstention: 3 }
                      : { toA: 2, toB: 95, toAbstention: 3 })
                  }
                  disabled={matrixKey !== "custom"}
                  onChange={(next) => {
                    const updated = { ...reservoirs, [id]: next };
                    setReservoirs(updated);
                    if (matrixKey === "custom") {
                      syncUrl({ matrix: "custom", reservoirs: updated });
                    }
                  }}
                />
              ))}
            </div>
          </details>

          <ExpressedScoreGauge
            labelA={labelA}
            labelB={labelB}
            expressedA={result.expressedA}
            expressedB={result.expressedB}
            scoreA={result.scoreA}
            scoreB={result.scoreB}
            abstentionBlanc={result.abstentionBlanc}
          />

          <div className="flex flex-wrap items-center gap-3">
            <ShareButton
              pollId={pollId}
              c1={c1}
              c2={c2}
              matrix={matrixKey}
              reservoirs={reservoirs}
            />
            <p className="text-xs text-veote-muted">
              L’URL encode pollId, c1, c2, matrix
              {matrixKey === "custom" ? " et r (réservoirs)" : ""}.
            </p>
          </div>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-veote-border px-4 py-6 text-sm text-veote-muted">
          Choisissez deux finalistes pour lancer la simulation.
        </p>
      )}
    </div>
  );
}

/** Helper serveur → props client : convertit Decimal / Date. */
export function toSimulatorPollOption(poll: {
  id: string;
  slug: string;
  title: string;
  institute: string;
  fieldworkEnd: Date;
  isTestStructure: boolean;
  results: {
    candidateId: string | null;
    label: string | null;
    percent: unknown;
    candidate?: { displayName: string } | null;
  }[];
}): SimulatorPollOption {
  return {
    id: poll.id,
    slug: poll.slug,
    title: poll.title,
    institute: poll.institute,
    fieldworkEnd: poll.fieldworkEnd.toISOString(),
    isTestStructure: poll.isTestStructure,
    results: poll.results.map((r) => ({
      candidateId: r.candidateId,
      label: r.label,
      percent: toNumber(r.percent as never),
      candidateName: r.candidate?.displayName ?? null,
    })),
  };
}

export function edgesToReservoirs(
  edges: {
    fromCandidateId: string;
    toKind: string;
    toCandidateId: string | null;
    percent: unknown;
  }[],
  finalistAId: string | null,
  finalistBId: string | null,
): ReservoirMap {
  const map: ReservoirMap = {};
  for (const e of edges) {
    const cur = map[e.fromCandidateId] ?? {
      toA: 0,
      toB: 0,
      toAbstention: 0,
    };
    const pct = toNumber(e.percent as never);
    if (e.toKind === "ABSTENTION_BLANC") {
      cur.toAbstention += pct;
    } else if (e.toCandidateId && e.toCandidateId === finalistAId) {
      cur.toA += pct;
    } else if (e.toCandidateId && e.toCandidateId === finalistBId) {
      cur.toB += pct;
    } else {
      // Arc vers un tiers hors duel : traité comme non-exprimé
      cur.toAbstention += pct;
    }
    map[e.fromCandidateId] = cur;
  }
  for (const k of Object.keys(map)) {
    map[k] = normalizeTriplet(map[k]);
  }
  return map;
}
