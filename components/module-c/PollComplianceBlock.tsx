import { SourceBadge } from "@/components/source/SourceBadge";

import {
  formatFieldworkRange,
  formatPercent,
  formatSampleSize,
  toNumber,
} from "@/lib/module-c/format";

export type PollComplianceSource = {
  label: string;
  url: string;
  organism?: string | null;
};

export type PollComplianceData = {
  institute: string;
  sponsor: string;
  fieldworkStart: Date | string;
  fieldworkEnd: Date | string;
  sampleSize: number;
  marginOfError: number | string | { toNumber?: () => number };
  population?: string | null;
  methodology?: string | null;
  commissionNoticeUrl: string;
  reportUrl?: string | null;
  isTestStructure?: boolean;
  title: string;
  sources?: PollComplianceSource[];
};

/**
 * Bloc obligatoire Commission des sondages :
 * institut, commanditaire, dates de terrain, n, marge d’erreur, SourceBadge.
 */
export function PollComplianceBlock({
  poll,
  className = "",
}: {
  poll: PollComplianceData;
  className?: string;
}) {
  const primaryNotice =
    poll.sources?.find((s) =>
      /commission|notice|ipsos|ifop|institut/i.test(s.label),
    ) ?? poll.sources?.[0];

  return (
    <section
      className={`veote-panel space-y-4 rounded-lg p-5 ${className}`}
      aria-label="Mentions Commission des sondages"
    >
      {poll.isTestStructure ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Structure d’exemple — ne constitue pas une intention de vote 2027
          officielle. Libellé :{" "}
          <span className="font-medium">
            [Sondage de test - Structure Commission des sondages]
          </span>
        </p>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
            Institut
          </dt>
          <dd className="font-medium text-veote-text">{poll.institute}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
            Commanditaire
          </dt>
          <dd className="font-medium text-veote-text">{poll.sponsor}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
            Dates de terrain
          </dt>
          <dd className="font-medium text-veote-text">
            {formatFieldworkRange(poll.fieldworkStart, poll.fieldworkEnd)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
            Taille d’échantillon
          </dt>
          <dd className="font-medium tabular-nums text-veote-text">
            {formatSampleSize(poll.sampleSize)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
            Marge d’erreur
          </dt>
          <dd className="font-medium tabular-nums text-veote-text">
            ± {formatPercent(toNumber(poll.marginOfError)).replace(" %", "")}{" "}
            pts
          </dd>
        </div>
        {poll.population ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
              Population
            </dt>
            <dd className="text-veote-text">{poll.population}</dd>
          </div>
        ) : null}
        {poll.methodology ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-veote-muted/80">
              Méthodologie
            </dt>
            <dd className="text-veote-muted">{poll.methodology}</dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap gap-2">
        <SourceBadge
          label={primaryNotice?.label ?? "Notice Commission / institut"}
          href={primaryNotice?.url ?? poll.commissionNoticeUrl}
          organism={
            primaryNotice?.organism ?? "Commission des sondages / institut"
          }
        />
        {poll.reportUrl && poll.reportUrl !== poll.commissionNoticeUrl ? (
          <SourceBadge
            label="Rapport institut"
            href={poll.reportUrl}
            organism={poll.institute}
          />
        ) : null}
      </div>
    </section>
  );
}
