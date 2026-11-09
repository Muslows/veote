"use client";

import {
  lockSliders,
  type TransferTriplet,
} from "@/lib/module-c/transfer-math";

type TransferSlidersProps = {
  fromLabel: string;
  finalistALabel: string;
  finalistBLabel: string;
  value: TransferTriplet;
  onChange: (next: TransferTriplet) => void;
  disabled?: boolean;
};

/**
 * 3 sliders verrouillés : %→A + %→B + % abstention/blanc = 100 %.
 */
export function TransferSliders({
  fromLabel,
  finalistALabel,
  finalistBLabel,
  value,
  onChange,
  disabled,
}: TransferSlidersProps) {
  const sum = value.toA + value.toB + value.toAbstention;

  function handle(key: keyof TransferTriplet, raw: string) {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange(lockSliders(value, key, n));
  }

  const rows: {
    key: keyof TransferTriplet;
    label: string;
  }[] = [
    { key: "toA", label: `→ ${finalistALabel}` },
    { key: "toB", label: `→ ${finalistBLabel}` },
    { key: "toAbstention", label: "→ Abstention / blanc" },
  ];

  return (
    <fieldset
      className="veote-panel space-y-3 rounded-lg p-4"
      disabled={disabled}
    >
      <legend className="px-1 text-sm font-semibold text-veote-text">
        Électorat {fromLabel}
      </legend>
      {rows.map((row) => (
        <label key={row.key} className="block space-y-1 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-veote-muted">{row.label}</span>
            <span className="tabular-nums font-medium text-veote-text">
              {value[row.key].toFixed(1).replace(".", ",")} %
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={value[row.key]}
            onChange={(e) => handle(row.key, e.target.value)}
            className="w-full accent-veote-accent"
            aria-valuetext={`${value[row.key]} pour cent`}
          />
        </label>
      ))}
      <p
        className={`text-xs tabular-nums ${
          Math.abs(sum - 100) < 0.15
            ? "text-veote-muted"
            : "text-amber-300"
        }`}
      >
        Total réservoir : {sum.toFixed(1).replace(".", ",")} %
        {Math.abs(sum - 100) < 0.15 ? " (verrouillé à 100 %)" : ""}
      </p>
    </fieldset>
  );
}
