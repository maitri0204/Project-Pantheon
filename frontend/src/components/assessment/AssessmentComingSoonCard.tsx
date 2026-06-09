import AssessmentReleaseStamp from "@/components/assessment/AssessmentReleaseStamp";

type AssessmentComingSoonCardProps = {
  name: string;
  categoryLabel: string;
  releaseDate: string;
};

export default function AssessmentComingSoonCard({
  name,
  categoryLabel,
  releaseDate,
}: AssessmentComingSoonCardProps) {
  return (
    <div
      className="assessment-coming-soon-card relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, #0c1a4a 0%, #122a6b 48%, #071336 100%)",
        border: "1px solid rgba(30, 64, 175, 0.45)",
        boxShadow: "0 16px 40px -12px rgba(15, 40, 120, 0.55)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
        style={{ background: "rgba(96, 165, 250, 0.22)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full blur-2xl"
        style={{ background: "rgba(34, 211, 238, 0.14)" }}
      />

      <div className="relative z-10 max-w-[56%]">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{
            color: "#422006",
            border: "1px solid rgba(252, 211, 77, 0.65)",
            background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 55%, #d97706 100%)",
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
          }}
        >
          {categoryLabel}
        </span>
        <h3 className="mt-3 text-lg font-black leading-tight text-white sm:text-xl">{name}</h3>
        <p
          className="mt-2 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: "#fbbf24", textShadow: "0 1px 2px rgba(0, 0, 0, 0.25)" }}
        >
          Coming Soon
        </p>
      </div>

      <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2 opacity-95 drop-shadow-xl">
        <AssessmentReleaseStamp releaseDate={releaseDate} size={172} />
      </div>
    </div>
  );
}
