import type { AttemptHistoryResultDisplay } from "@/lib/assessmentAccess";

type AttemptHistoryResultSummaryProps = {
  result: AttemptHistoryResultDisplay;
  labelClassName?: string;
  valueClassName?: string;
};

export default function AttemptHistoryResultSummary({
  result,
  labelClassName = "text-black",
  valueClassName = "font-semibold text-black",
}: AttemptHistoryResultSummaryProps) {
  if (result.scoreLines?.length) {
    return (
      <div className="grid gap-2 text-sm">
        {result.scoreLines.map((line) => (
          <div key={line.label} className="flex flex-wrap items-center justify-between gap-2">
            <span className={labelClassName}>{line.label}</span>
            <span className={`break-words text-right ${valueClassName}`}>{line.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className={labelClassName}>{result.label}</span>
      <span className={`break-words text-right ${valueClassName}`}>{result.value}</span>
    </div>
  );
}
