/**
 * Query params partageables du simulateur :
 *   ?pollId=&c1=&c2=&matrix=&r=
 * r = reservoirs custom encodés (voir transfer-math.encodeReservoirs)
 */

import {
  decodeReservoirs,
  encodeReservoirs,
  type ReservoirMap,
} from "./transfer-math";

export type SimulatorShareState = {
  pollId: string | null;
  c1: string | null;
  c2: string | null;
  matrix: string | null; // slug ou id ; "custom" = mode libre
  reservoirs: ReservoirMap;
};

export function parseSimulatorSearchParams(
  raw: Record<string, string | string[] | undefined>,
): SimulatorShareState {
  const one = (k: string) => {
    const v = raw[k];
    if (Array.isArray(v)) return v[0] ?? null;
    return v ?? null;
  };

  const matrix = one("matrix");
  const r = one("r");

  return {
    pollId: one("pollId") ?? one("poll"),
    c1: one("c1"),
    c2: one("c2"),
    matrix,
    reservoirs:
      matrix === "custom" || r
        ? decodeReservoirs(r)
        : {},
  };
}

export function buildSimulatorQuery(state: {
  pollId?: string | null;
  c1?: string | null;
  c2?: string | null;
  matrix?: string | null;
  reservoirs?: ReservoirMap;
}): string {
  const params = new URLSearchParams();
  if (state.pollId) params.set("pollId", state.pollId);
  if (state.c1) params.set("c1", state.c1);
  if (state.c2) params.set("c2", state.c2);
  if (state.matrix) params.set("matrix", state.matrix);
  if (state.matrix === "custom" && state.reservoirs) {
    const encoded = encodeReservoirs(state.reservoirs);
    if (encoded) params.set("r", encoded);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}
