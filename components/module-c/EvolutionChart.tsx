"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { toNumber } from "@/lib/module-c/format";

export type EvolutionPoint = {
  /** Clé date ISO (fieldworkEnd) */
  date: string;
  dateLabel: string;
  pollTitle: string;
  isTestStructure: boolean;
  institute: string;
  /** candidateId → percent */
  [candidateKey: string]: string | number | boolean;
};

export type EvolutionSeriesMeta = {
  key: string;
  label: string;
  color: string;
};

const NEUTRAL_PALETTE = [
  "#60a5fa",
  "#94a3b8",
  "#38bdf8",
  "#a3e635",
  "#fbbf24",
  "#c084fc",
  "#2dd4bf",
  "#fb7185",
];

type EvolutionChartProps = {
  data: EvolutionPoint[];
  series: EvolutionSeriesMeta[];
  className?: string;
};

/**
 * Courbes Recharts — intentions dans le temps (filtre institut côté page).
 * Couleurs neutres (pas de palette partisane figée).
 */
export function EvolutionChart({
  data,
  series,
  className = "",
}: EvolutionChartProps) {
  if (data.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-veote-border px-4 py-8 text-sm text-veote-muted">
        Aucun point de sondage pour ce filtre.
      </p>
    );
  }

  return (
    <div className={`h-80 w-full sm:h-96 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="dateLabel"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            unit="%"
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#f8fafc",
            }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as EvolutionPoint | undefined;
              if (!p) return "";
              return `${p.pollTitle}${p.isTestStructure ? " · TEST" : ""}`;
            }}
            formatter={(value: number | string, name: string) => [
              `${toNumber(value).toFixed(1).replace(".", ",")} %`,
              series.find((s) => s.key === name)?.label ?? name,
            ]}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8", fontSize: 12 }}
            formatter={(value) =>
              series.find((s) => s.key === value)?.label ?? value
            }
          />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={s.color || NEUTRAL_PALETTE[i % NEUTRAL_PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
              isAnimationActive
              animationDuration={600}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function buildEvolutionSeriesColors(
  keys: { key: string; label: string }[],
): EvolutionSeriesMeta[] {
  return keys.map((k, i) => ({
    ...k,
    color: NEUTRAL_PALETTE[i % NEUTRAL_PALETTE.length],
  }));
}
