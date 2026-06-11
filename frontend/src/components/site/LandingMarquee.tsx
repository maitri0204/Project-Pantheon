import { LANDING_ASSESSMENTS } from "@/lib/landingAssessments";

export default function LandingMarquee() {
  const items = LANDING_ASSESSMENTS.map((a) => ({ emoji: a.emoji, name: a.shortName }));
  const doubled = [...items, ...items];

  return (
    <div className="marquee-strip border-y border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-sky-50/80 py-4 backdrop-blur-sm">
      <div className="marquee-track flex w-max gap-4 whitespace-nowrap px-4">
        {doubled.map((item, index) => (
          <span
            key={`${item.name}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <span className="text-base">{item.emoji}</span>
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
