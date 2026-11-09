type GroupPosition = {
  id: string;
  position: string;
  count: number | null;
  group: {
    id: string;
    slug: string;
    name: string;
    acronym: string | null;
  } | null;
};

type GroupVoteTableProps = {
  positions: GroupPosition[];
};

const ORDER = ["POUR", "CONTRE", "ABSTENTION", "NON_VOTANT"] as const;

/**
 * Tableau agrégé Pour / Contre / Abstention par groupe parlementaire.
 */
export function GroupVoteTable({ positions }: GroupVoteTableProps) {
  const byGroup = new Map<
    string,
    {
      group: NonNullable<GroupPosition["group"]>;
      pour: number;
      contre: number;
      abstention: number;
      nonVotant: number;
    }
  >();

  for (const p of positions) {
    if (!p.group) continue;
    const row = byGroup.get(p.group.id) ?? {
      group: p.group,
      pour: 0,
      contre: 0,
      abstention: 0,
      nonVotant: 0,
    };
    const n = p.count ?? 0;
    if (p.position === "POUR") row.pour += n;
    else if (p.position === "CONTRE") row.contre += n;
    else if (p.position === "ABSTENTION") row.abstention += n;
    else if (p.position === "NON_VOTANT") row.nonVotant += n;
    byGroup.set(p.group.id, row);
  }

  const rows = Array.from(byGroup.values()).sort((a, b) => {
    const score = (r: typeof a) => r.pour + r.contre + r.abstention;
    return score(b) - score(a);
  });

  if (rows.length === 0) {
    return (
      <p className="text-sm text-veote-muted">
        Aucune répartition par groupe importée pour ce scrutin.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Votes par groupe parlementaire
        </caption>
        <thead>
          <tr className="border-b border-veote-border text-xs uppercase tracking-wide text-veote-muted">
            <th scope="col" className="py-2 pr-3 font-semibold">
              Groupe
            </th>
            {ORDER.map((k) => (
              <th
                key={k}
                scope="col"
                className="px-2 py-2 text-right font-semibold tabular-nums"
              >
                {k === "NON_VOTANT" ? "N.V." : k.charAt(0) + k.slice(1).toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.group.id}
              className="border-b border-veote-border/50 text-veote-text"
            >
              <th scope="row" className="py-2.5 pr-3 font-medium">
                {r.group.acronym ?? r.group.name}
                {r.group.acronym ? (
                  <span className="mt-0.5 block text-xs font-normal text-veote-muted">
                    {r.group.name}
                  </span>
                ) : null}
              </th>
              <td className="px-2 py-2.5 text-right tabular-nums">
                {r.pour || "—"}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">
                {r.contre || "—"}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">
                {r.abstention || "—"}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums text-veote-muted">
                {r.nonVotant || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
