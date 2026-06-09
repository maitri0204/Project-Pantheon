import { formatReleaseStampParts } from "@/lib/assessmentRelease";

type AssessmentReleaseStampProps = {
  releaseDate: string;
  size?: number;
};

const GRAY = "#6b7a8d";
const BLUE = "#2f80c8";

function scallopPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number): string {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (Math.PI * 2 * i) / (teeth * 2) - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    pts.push(`${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}

export default function AssessmentReleaseStamp({ releaseDate, size = 160 }: AssessmentReleaseStampProps) {
  const { day, monthYear } = formatReleaseStampParts(releaseDate);
  const cx = 110, cy = 110;

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      role="img"
      aria-label={`Releasing on ${day} ${monthYear}`}
    >
      <g transform="rotate(-12 110 110)">
        {/* Scalloped outer ring */}
        <path d={scallopPath(cx, cy, 100, 90, 26)} fill={GRAY} />

        {/* White fill */}
        <circle cx={cx} cy={cy} r={84} fill="#fff" />

        {/* Outer ring stroke */}
        <circle cx={cx} cy={cy} r={84} fill="none" stroke={GRAY} strokeWidth="2.5" />

        {/* Inner decorative ring */}
        <circle cx={cx} cy={cy} r={74} fill="none" stroke={GRAY} strokeWidth="1.2" />

        {/* Curved text paths */}
        <defs>
          <path id="sa-top" d={`M ${cx - 66},${cy} A 66,66 0 0,1 ${cx + 66},${cy}`} />
          <path id="sa-bot" d={`M ${cx - 66},${cy} A 66,66 0 0,0 ${cx + 66},${cy}`} />
        </defs>

        {/* Top arc label */}
        <text fill={BLUE} fontSize="10.5" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="2.6">
          <textPath href="#sa-top" startOffset="50%" textAnchor="middle">
            ✦ RELEASING ON ✦
          </textPath>
        </text>

        {/* Bottom arc label */}
        <text fill={BLUE} fontSize="10.5" fontWeight="700" fontFamily="Arial,sans-serif" letterSpacing="2.2">
          <textPath href="#sa-bot" startOffset="50%" textAnchor="middle">
            ✦ SAVE THE DATE ✦
          </textPath>
        </text>

        {/* Horizontal divider lines */}
        <line x1="52" y1="104" x2="168" y2="104" stroke={GRAY} strokeWidth="1.2" />
        <line x1="52" y1="130" x2="168" y2="130" stroke={GRAY} strokeWidth="1.2" />

        {/* Day number */}
        <text
          x={cx} y="125"
          textAnchor="middle"
          fill={BLUE}
          fontSize="36"
          fontWeight="900"
          fontFamily="Arial,sans-serif"
          letterSpacing="-1"
        >
          {day}
        </text>

        {/* Month label */}
        <text
          x={cx} y="148"
          textAnchor="middle"
          fill={GRAY}
          fontSize="10"
          fontWeight="700"
          fontFamily="Arial,sans-serif"
          letterSpacing="2.5"
        >
          {monthYear}
        </text>
      </g>
    </svg>
  );
}
