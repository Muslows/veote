/**
 * Mathématique simulateur 2ᵉ tour — Module C.
 * - Sliders verrouillés à 100 % par électorat éliminé
 * - Scores finaux en suffrages exprimés (hors abstention/blanc)
 */

export const ABSTENTION_KEY = "__ABSTENTION_BLANC__";

export type TransferTriplet = {
  /** % vers finaliste A */
  toA: number;
  /** % vers finaliste B */
  toB: number;
  /** % abstention / blanc / nul */
  toAbstention: number;
};

export type ReservoirMap = Record<string, TransferTriplet>;

export type FirstRoundShare = {
  candidateId: string;
  percent: number;
  label: string;
};

export type SimulationResult = {
  scoreA: number;
  scoreB: number;
  /** Part hors exprimés (info) */
  abstentionBlanc: number;
  /** Scores renormalisés en suffrages exprimés (somme = 100) */
  expressedA: number;
  expressedB: number;
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Normalise un triplet pour sommer exactement 100 (tolérance flottante). */
export function normalizeTriplet(t: TransferTriplet): TransferTriplet {
  const raw = {
    toA: clamp(t.toA),
    toB: clamp(t.toB),
    toAbstention: clamp(t.toAbstention),
  };
  const sum = raw.toA + raw.toB + raw.toAbstention;
  if (sum <= 0) return { toA: 0, toB: 0, toAbstention: 100 };
  if (Math.abs(sum - 100) < 0.05) {
    // Ajuste le dernier pour coller à 100.0
    const toA = round1(raw.toA);
    const toB = round1(raw.toB);
    return { toA, toB, toAbstention: round1(100 - toA - toB) };
  }
  const f = 100 / sum;
  const toA = round1(raw.toA * f);
  const toB = round1(raw.toB * f);
  return { toA, toB, toAbstention: round1(100 - toA - toB) };
}

/**
 * Quand un slider bouge, redistribue proportionnellement les deux autres
 * pour conserver une somme exacte de 100 %.
 */
export function lockSliders(
  current: TransferTriplet,
  changed: keyof TransferTriplet,
  newValue: number,
): TransferTriplet {
  const next = clamp(round1(newValue));
  const others = (["toA", "toB", "toAbstention"] as const).filter(
    (k) => k !== changed,
  );
  const remaining = round1(100 - next);
  const o0 = current[others[0]];
  const o1 = current[others[1]];
  const otherSum = o0 + o1;

  let v0: number;
  let v1: number;
  if (otherSum <= 0) {
    v0 = round1(remaining / 2);
    v1 = round1(remaining - v0);
  } else {
    v0 = round1((o0 / otherSum) * remaining);
    v1 = round1(remaining - v0);
  }

  const result: TransferTriplet = {
    toA: current.toA,
    toB: current.toB,
    toAbstention: current.toAbstention,
  };
  result[changed] = next;
  result[others[0]] = v0;
  result[others[1]] = v1;
  return normalizeTriplet(result);
}

/**
 * Applique les reports aux parts du 1er tour.
 * Les finalistes sont inclus (fidélité via leur propre triplet).
 * Résultat en points de % du corps électoral, puis exprimés.
 */
export function simulateSecondRound(input: {
  shares: FirstRoundShare[];
  finalistAId: string;
  finalistBId: string;
  reservoirs: ReservoirMap;
}): SimulationResult {
  const { shares, finalistAId, finalistBId, reservoirs } = input;
  let scoreA = 0;
  let scoreB = 0;
  let abstentionBlanc = 0;

  for (const share of shares) {
    if (!share.candidateId || share.percent <= 0) continue;
    // Candidats hors duel + finalistes (fidélité) : appliquer leur matrice
    if (
      share.candidateId !== finalistAId &&
      share.candidateId !== finalistBId &&
      !reservoirs[share.candidateId]
    ) {
      // Pas de matrice → abstention par défaut
      abstentionBlanc += share.percent;
      continue;
    }

    const trip =
      reservoirs[share.candidateId] ??
      (share.candidateId === finalistAId
        ? { toA: 100, toB: 0, toAbstention: 0 }
        : share.candidateId === finalistBId
          ? { toA: 0, toB: 100, toAbstention: 0 }
          : { toA: 0, toB: 0, toAbstention: 100 });

    const t = normalizeTriplet(trip);
    scoreA += (share.percent * t.toA) / 100;
    scoreB += (share.percent * t.toB) / 100;
    abstentionBlanc += (share.percent * t.toAbstention) / 100;
  }

  scoreA = round1(scoreA);
  scoreB = round1(scoreB);
  abstentionBlanc = round1(abstentionBlanc);

  const expressed = scoreA + scoreB;
  if (expressed <= 0) {
    return {
      scoreA,
      scoreB,
      abstentionBlanc,
      expressedA: 0,
      expressedB: 0,
    };
  }

  return {
    scoreA,
    scoreB,
    abstentionBlanc,
    expressedA: round1((scoreA / expressed) * 100),
    expressedB: round1((scoreB / expressed) * 100),
  };
}

/** Encode reservoirs → chaîne compacte pour URL (fromId:a,b,abs;…). */
export function encodeReservoirs(map: ReservoirMap): string {
  return Object.entries(map)
    .map(([id, t]) => {
      const n = normalizeTriplet(t);
      return `${id}:${n.toA},${n.toB},${n.toAbstention}`;
    })
    .join(";");
}

export function decodeReservoirs(raw: string | null | undefined): ReservoirMap {
  if (!raw) return {};
  const out: ReservoirMap = {};
  for (const part of raw.split(";")) {
    const [id, nums] = part.split(":");
    if (!id || !nums) continue;
    const [a, b, abs] = nums.split(",").map((x) => Number(x));
    if ([a, b, abs].some((n) => Number.isNaN(n))) continue;
    out[id] = normalizeTriplet({ toA: a, toB: b, toAbstention: abs });
  }
  return out;
}
