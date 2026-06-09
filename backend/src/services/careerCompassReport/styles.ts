export const reportStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Serif+Display:ital@0;1&display=swap');

  :root {
    --navy: #0c1f3d;
    --navy-mid: #1a3560;
    --navy-light: #2a4f7a;
    --gold: #c4a052;
    --gold-light: #e8d5a3;
    --gold-pale: #faf6ec;
    --slate: #000000;
    --slate-light: #000000;
    --border: #dde3ed;
    --surface: #f4f6f9;
    --surface-2: #eef1f6;
    --white: #ffffff;
    --success: #1a6b4a;
    --success-bg: #e8f5ef;
    --warn: #8b5e1a;
    --warn-bg: #fdf4e3;
    --risk: #8b2942;
    --risk-bg: #fceef2;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--navy);
    background: var(--white);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    height: 297mm;
    padding: 14mm 16mm 18mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    background: var(--white);
  }

  .page:last-child { page-break-after: auto; }

  .page-inner { height: calc(297mm - 32mm); display: flex; flex-direction: column; }

  .page-footer {
    position: absolute;
    bottom: 10mm;
    left: 16mm;
    right: 16mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    padding-top: 6px;
    font-size: 10.5px;
    color: #000000;
    letter-spacing: 0.3px;
  }

  .page-num {
    font-weight: 700;
    color: #000000;
    background: var(--surface);
    padding: 2px 10px;
    border-radius: 10px;
  }

  /* ── COVER ── */
  .cover {
    background: var(--navy);
    padding: 0;
    display: block;
  }

  .cover-top-bar {
    height: 4px;
    background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
  }

  .cover-body {
    padding: 16mm 18mm 14mm;
    height: calc(297mm - 18mm);
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 0;
    color: #fff;
  }

  .cover-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0;
  }

  .cover-left {
    flex: 1;
    padding-right: 12mm;
  }

  .cover-lower {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
    padding: 6mm 2px 4mm;
  }

  .cover-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(196,160,82,0.15);
    border: 1px solid rgba(196,160,82,0.5);
    color: var(--gold-light);
    padding: 5px 14px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .cover-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    background: var(--gold);
    border-radius: 50%;
  }

  .cover h1 {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 41px;
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.5px;
    margin-bottom: 10px;
  }

  .cover-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.55);
    font-weight: 400;
    line-height: 1.6;
    max-width: 280px;
  }

  .cover-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .personality-hero {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: linear-gradient(145deg, rgba(196,160,82,0.2), rgba(196,160,82,0.05));
    border: 2px solid var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 0 0 0 8px rgba(196,160,82,0.08), 0 20px 60px rgba(0,0,0,0.3);
    position: relative;
  }

  .personality-hero::after {
    content: '';
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    border: 1px solid rgba(196,160,82,0.2);
  }

  .personality-hero .type {
    font-size: 15px;
    font-weight: 800;
    text-align: center;
    line-height: 1.25;
    padding: 0 10px;
    color: #fff;
  }

  .personality-hero .label {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--gold);
    margin-top: 5px;
    font-weight: 700;
  }

  .cover-mid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8mm;
    padding: 0 2px;
    width: 100%;
    max-width: 320px;
  }

  .cover-meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 2px;
  }

  .cover-meta-item:not(:last-child) {
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 14px;
  }

  .cover-meta-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.45);
    font-weight: 600;
  }

  .cover-meta-value {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    line-height: 1.25;
  }

  .exec-statement {
    padding: 0 2px;
    font-size: 13px;
    line-height: 1.75;
    color: rgba(255,255,255,0.75);
    border-top: 1px solid rgba(255,255,255,0.12);
    padding-top: 6mm;
  }

  /* ── PAGE HEADER ── */
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .page-header-left .section-tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--gold);
    font-weight: 700;
    margin-bottom: 3px;
  }

  .page-header h2 {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 23px;
    font-weight: 400;
    color: var(--navy);
    letter-spacing: -0.2px;
    line-height: 1.2;
  }

  .page-header-accent {
    width: 40px;
    height: 3px;
    background: var(--gold);
    border-radius: 2px;
    margin-bottom: 14px;
  }

  /* ── EXECUTIVE SUMMARY ── */
  .exec-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .metric-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 10px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--navy-mid);
  }

  .metric-card.hero {
    background: var(--navy);
    border-color: var(--navy);
  }

  .metric-card.hero::before { background: var(--gold); }

  .metric-card .value {
    font-size: 17px;
    font-weight: 800;
    color: var(--navy);
    line-height: 1.2;
    margin-bottom: 3px;
  }

  .metric-card.hero .value { color: #fff; font-size: 25px; }

  .metric-card .label {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--slate-light);
    font-weight: 700;
  }

  .metric-card.hero .label { color: rgba(255,255,255,0.5); }

  .exec-intro {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 10px;
    flex-shrink: 0;
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .exec-intro p {
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--slate);
  }

  .exec-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    flex: 1;
    min-height: 0;
  }

  .exec-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  .exec-panel > .card { flex: 1; min-height: 0; }

  .page-exec .exec-metrics {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  .page-exec .exec-metrics .metric-card {
    padding: 14px 12px;
  }

  .page-exec .exec-intro {
    margin-bottom: 12px;
  }

  .page-exec .exec-panels {
    gap: 10px;
    flex: 1;
  }

  .page-exec .exec-panel {
    gap: 10px;
    flex: 1;
  }

  .page-exec .exec-panel > .card {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
  }
  .page-exec .exec-panel > .card h3 {
    font-size: 11.5px;
    margin-bottom: 5px;
    gap: 5px;
  }
  .page-exec .exec-panel > .card .card-icon {
    width: 16px;
    height: 16px;
    font-size: 11px;
  }
  .page-exec .exec-panel > .card ul li {
    font-size: 10.8px;
    line-height: 1.42;
    padding: 1.5px 0 1.5px 10px;
  }

  .exec-bottom {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
    flex-shrink: 0;
  }

  .exec-bottom .card { flex: 0 0 auto; }

  /* ── CARDS ── */
  .card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 13px;
    flex: 1;
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .card-compact { flex: 0 0 auto; }

  .card h3 {
    font-size: 12.5px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    gap: 7px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-icon {
    width: 20px;
    height: 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .card ul { list-style: none; padding: 0; }

  .card ul li {
    font-size: 12px;
    line-height: 1.55;
    color: var(--slate);
    padding: 2.5px 0 2.5px 11px;
    position: relative;
  }

  .card ul li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 4px;
    height: 4px;
    border-radius: 1px;
    background: var(--gold);
  }

  .card p {
    font-size: 12px;
    line-height: 1.6;
    color: var(--slate);
  }

  .card-strength { border-left: 3px solid var(--success); }
  .card-strength .card-icon { background: var(--success-bg); color: var(--success); }
  .card-strength ul li::before { background: var(--success); }

  .card-growth { border-left: 3px solid var(--warn); }
  .card-growth .card-icon { background: var(--warn-bg); color: var(--warn); }
  .card-growth ul li::before { background: var(--warn); }

  .card-insight {
    border-left: 3px solid var(--navy-mid);
    box-shadow: 0 3px 14px rgba(12,31,61,0.12), 0 1px 4px rgba(12,31,61,0.08);
  }
  .card-insight .card-icon { background: var(--surface); color: var(--navy); }

  .card-snapshot { border-left: 3px solid var(--gold); background: var(--gold-pale); }
  .card-snapshot .card-icon { background: rgba(196,160,82,0.2); color: var(--warn); }

  .card-motivator { border-top: 2px solid var(--gold); }
  .card-motivator .card-icon { background: var(--gold-pale); color: var(--warn); }

  .card-challenge { border-top: 2px solid var(--risk); }
  .card-challenge .card-icon { background: var(--risk-bg); color: var(--risk); }

  .card-style { background: var(--surface); border-color: transparent; }
  .card-style .card-icon { background: var(--navy); color: #fff; }

  .card-highlight {
    background: var(--navy);
    border-color: var(--navy);
  }

  .card-highlight h3 { color: #fff; }
  .card-highlight ul li { color: rgba(255,255,255,0.75); }
  .card-highlight ul li::before { background: var(--gold); }

  .card-risk { border-left: 3px solid var(--risk); }
  .card-risk .card-icon { background: var(--risk-bg); color: var(--risk); }
  .card-risk ul li::before { background: var(--risk); }

  .card-opportunity { border-left: 3px solid var(--success); }
  .card-opportunity .card-icon { background: var(--success-bg); color: var(--success); }

  /* ── DNA GRID ── */
  .dna-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 8px;
    flex: 1;
  }

  .dna-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 13px;
    position: relative;
    overflow: hidden;
  }

  .dna-card::before {
    content: attr(data-num);
    position: absolute;
    top: 7px;
    right: 11px;
    font-size: 29px;
    font-weight: 800;
    color: var(--surface-2);
    line-height: 1;
  }

  .dna-card h3 {
    font-size: 12.5px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
  }

  .dna-card ul li { padding: 2px 0 2px 11px; }

  .dna-card ul { list-style: none; position: relative; }
  .dna-card ul li {
    font-size: 12px;
    line-height: 1.55;
    color: var(--slate);
    padding: 2.5px 0 2.5px 11px;
    position: relative;
  }
  .dna-card ul li::before {
    content: '';
    position: absolute;
    left: 0; top: 8px;
    width: 4px; height: 4px;
    border-radius: 1px;
    background: var(--navy-mid);
  }

  .dna-card.accent {
    background: var(--navy);
    border-color: var(--navy);
  }
  .dna-card.accent h3 { color: var(--gold-light); }
  .dna-card.accent ul li { color: #ffffff; }
  .dna-card.accent ul li::before { background: var(--gold); }
  .dna-card.accent::before { color: var(--gold); opacity: 0.85; }

  /* ── DIMENSION OVERVIEW (Page 4) ── */
  .dimension-overview {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .dimension-overview-intro h3 {
    font-size: 21px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 4px;
    letter-spacing: -0.2px;
  }

  .dimension-overview-intro p {
    font-size: 12.5px;
    color: var(--slate-light);
    line-height: 1.5;
  }

  .dimension-cards-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 14px;
    flex: 1;
    align-items: stretch;
  }

  .dimension-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 16px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
    box-shadow: 0 2px 12px rgba(12,31,61,0.05);
  }

  .dimension-card-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 14px;
    line-height: 1.3;
  }

  .dimension-wheel {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    padding: 10px;
    flex-shrink: 0;
  }

  .dimension-wheel .wheel-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--slate);
    line-height: 1.25;
    margin-bottom: 4px;
    max-width: 120px;
  }

  .dimension-wheel .wheel-pct {
    font-size: 39px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -1.5px;
  }

  .dimension-secondary {
    font-size: 12px;
    color: var(--slate-light);
    line-height: 1.45;
    margin-bottom: 12px;
    min-height: 22px;
  }

  .dimension-secondary b {
    color: var(--slate);
    font-weight: 700;
  }

  .dimension-split-bar {
    width: 100%;
    max-width: 260px;
    height: 9px;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    margin-bottom: 8px;
  }

  .dimension-split-bar .seg-left,
  .dimension-split-bar .seg-right {
    height: 100%;
  }

  .dimension-bar-labels {
    width: 100%;
    max-width: 260px;
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }

  .dimension-bar-labels span {
    font-size: 10px;
    font-weight: 700;
    color: var(--slate);
    line-height: 1.25;
    max-width: 48%;
    text-align: center;
  }

  .dimension-bar-labels span:first-child { text-align: left; }
  .dimension-bar-labels span:last-child { text-align: right; }

  /* Energy — purple / green */
  .dim-energy .dimension-wheel { border-color: #7C3AED; background: rgba(124,58,237,0.06); }
  .dim-energy .wheel-pct { color: #7C3AED; }

  /* Life — red / teal */
  .dim-life .dimension-wheel { border-color: #EF4444; background: rgba(239,68,68,0.06); }
  .dim-life .wheel-pct { color: #EF4444; }

  /* Cognitive — blue / orange */
  .dim-cognitive .dimension-wheel { border-color: #3B82F6; background: rgba(59,130,246,0.06); }
  .dim-cognitive .wheel-pct { color: #3B82F6; }

  /* Values — gold / pink */
  .dim-values .dimension-wheel { border-color: #FBBF24; background: rgba(251,191,36,0.08); }
  .dim-values .wheel-pct { color: #D97706; }

  /* ── DEEP DIVE ── */
  .dive-row-top {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .dive-row-bottom {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
    min-height: 0;
  }

  .dive-row-bottom .card {
    flex: 1;
    min-height: 0;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
  }

  .dive-row-bottom .card h3 {
    font-size: 13.5px;
    margin-bottom: 6px;
  }

  .dive-row-bottom .card ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 18px;
    row-gap: 0;
    flex: 1;
    align-content: start;
  }

  .dive-row-bottom .card ul li {
    font-size: 11px;
    line-height: 1.45;
    padding: 2px 0 2px 11px;
  }

  /* ── ACADEMIC ── */
  .academic-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr auto;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  .academic-grid > .card {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .academic-grid > .card ul { flex: 1; }

  .academic-span {
    grid-column: 1 / -1;
    margin-top: 6px;
    padding-top: 4px;
  }

  /* ── STREAM ── */
  .stream-layout { display: flex; flex-direction: column; gap: 10px; flex: 1; }

  .stream-card {
    border-radius: 10px;
    padding: 12px 15px;
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .stream-card.recommended {
    background: var(--gold-pale);
    border: 2px solid var(--gold);
    box-shadow: 0 2px 12px rgba(196,160,82,0.12);
  }

  .stream-card.secondary-card {
    background: var(--surface);
    border: 1px dashed var(--border);
    box-shadow: none;
  }

  .stream-card h4 {
    font-size: 14px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 7px;
    display: flex;
    align-items: center;
  }

  .stream-list { list-style: none; padding: 0; }

  .stream-list li {
    font-size: 12px;
    color: var(--slate);
    padding: 3px 0 3px 14px;
    position: relative;
    line-height: 1.5;
  }

  .stream-list li::before {
    content: '';
    position: absolute;
    left: 0; top: 9px;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--gold);
  }

  .stream-card p {
    font-size: 12px;
    color: var(--slate-light);
    line-height: 1.55;
  }

  /* ── SUBJECT ── */
  .subject-layout { display: flex; flex-direction: column; gap: 7px; flex: 1; }

  .subject-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    border-left: 3px solid var(--gold);
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .subject-card h3 {
    font-size: 13px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .subject-card ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; }
  .subject-card ul li {
    font-size: 11.5px;
    color: var(--slate);
    line-height: 1.5;
    padding: 2px 0;
  }

  /* ── CLUSTERS ── */
  .cluster-layout { display: flex; flex-direction: column; gap: 6px; flex: 1; }

  .cluster-card {
    display: grid;
    grid-template-columns: 28px 1fr auto;
    grid-template-rows: auto auto;
    gap: 2px 10px;
    align-items: center;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 12px;
  }

  .cluster-rank {
    grid-row: 1 / 3;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--navy);
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cluster-card:nth-child(1) .cluster-rank { background: var(--gold); color: var(--navy); }
  .cluster-card:nth-child(2) .cluster-rank { background: var(--navy-mid); }
  .cluster-card:nth-child(3) .cluster-rank { background: var(--navy-light); }

  .cluster-name {
    font-size: 13px;
    font-weight: 800;
    color: var(--navy);
  }

  .cluster-pct {
    font-size: 19px;
    font-weight: 800;
    color: var(--gold);
    grid-row: 1 / 3;
    align-self: center;
  }

  .cluster-bar-wrap { grid-column: 2; }
  .cluster-bar-track {
    height: 5px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }
  .cluster-bar-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--navy), var(--gold));
  }

  .cluster-desc {
    grid-column: 2;
    font-size: 11px;
    color: var(--slate-light);
    line-height: 1.45;
  }

  /* ── CAREER MATCHES ── */
  .matches-layout { display: flex; flex-direction: column; gap: 0; flex: 1; }

  .career-match {
    display: grid;
    grid-template-columns: 32px 1fr 52px;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
  }

  .career-match:first-child {
    background: var(--gold-pale);
    border: 1px solid rgba(196,160,82,0.3);
    border-radius: 10px 10px 0 0;
    padding: 10px;
  }

  .career-match:nth-child(2),
  .career-match:nth-child(3) {
    background: var(--surface);
  }

  .career-match:last-child { border-bottom: none; border-radius: 0 0 10px 10px; }

  .match-rank {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--navy);
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .career-match:first-child .match-rank {
    background: var(--gold);
    color: var(--navy);
    width: 36px;
    height: 36px;
    font-size: 17px;
  }

  .match-info .name {
    font-size: 13px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 2px;
  }

  .career-match:first-child .match-info .name { font-size: 15px; }

  .match-info .why {
    font-size: 11px;
    color: var(--slate-light);
    line-height: 1.45;
  }

  .match-pct {
    font-size: 18px;
    font-weight: 800;
    color: var(--gold);
    text-align: right;
  }

  .career-match:first-child .match-pct { font-size: 23px; }

  .match-pct-bar {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    margin-top: 4px;
    overflow: hidden;
  }

  .match-pct-bar-fill {
    height: 100%;
    background: var(--gold);
    border-radius: 2px;
  }

  /* ── ROLE EXPLORER ── */
  .roles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(5, 1fr);
    gap: 6px;
    flex: 1;
    min-height: 0;
  }

  .role-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 9px;
    padding: 7px 11px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
    min-height: 0;
  }

  .role-stage {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gold);
  }

  .role-card h3 {
    font-size: 10.5px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 4px;
    padding-bottom: 3px;
    border-bottom: 2px solid var(--gold);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .role-summary {
    font-size: 8.5px;
    color: var(--slate-light);
    line-height: 1.35;
    margin-bottom: 4px;
    font-style: italic;
  }

  .role-card ul {
    list-style: none;
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
    row-gap: 0;
    align-content: start;
  }
  .role-card ul li {
    font-size: 8px;
    line-height: 1.3;
    color: var(--slate);
    padding: 1.5px 0 1.5px 10px;
    position: relative;
  }
  .role-card ul li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--gold);
    font-size: 8px;
  }

  .page-roles .role-card {
    padding: 9px 12px;
  }

  .page-roles .role-card h3 {
    font-size: 12.5px;
    margin-bottom: 5px;
    padding-bottom: 4px;
  }

  .page-roles .role-summary {
    font-size: 10.5px;
    line-height: 1.45;
    margin-bottom: 5px;
  }

  .page-roles .role-card ul li {
    font-size: 10px;
    line-height: 1.4;
    padding: 2px 0 2px 10px;
  }

  .page-roles .role-card ul li::before {
    font-size: 10px;
  }

  /* ── INDUSTRY ── */
  .industry-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .industry-grid-10 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: repeat(5, 1fr);
    gap: 6px;
    margin-bottom: 0;
    flex: 1;
    min-height: 0;
  }

  .industry-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    border-top: 3px solid var(--navy-mid);
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .industry-grid-10 .industry-card {
    padding: 6px 11px;
    border-top-width: 2px;
    display: flex;
    flex-direction: column;
  }

  .industry-card h3 {
    font-size: 12px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .industry-grid-10 .industry-card h3 {
    font-size: 10px;
    margin-bottom: 4px;
  }

  .industry-card ul { list-style: none; }
  .industry-card ul li {
    font-size: 11px;
    line-height: 1.5;
    color: var(--slate);
    padding: 2px 0;
  }

  .industry-grid-10 .industry-card ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
    row-gap: 0;
    flex: 1;
    align-content: start;
  }

  .industry-grid-10 .industry-card ul li {
    font-size: 8px;
    line-height: 1.3;
    padding: 1.5px 0;
  }

  .industry-grid-10 .industry-card ul li:last-child {
    grid-column: 1 / -1;
  }

  /* ── INDUSTRY LIST (readable) ── */
  .industry-intro {
    font-size: 10.5px;
    line-height: 1.5;
    color: var(--slate);
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .industry-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
    min-height: 0;
  }

  .industry-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--gold);
    border-radius: 9px;
    padding: 8px 13px;
    flex: 1;
    min-height: 0;
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .industry-item-body {
    flex: 1;
    min-width: 0;
  }

  .industry-item-name {
    font-size: 11.5px;
    font-weight: 800;
    color: var(--navy);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
  }

  .industry-item-desc {
    font-size: 9.5px;
    line-height: 1.4;
    color: var(--slate);
  }

  .industry-item-action {
    flex: 0 0 130px;
    font-size: 9px;
    line-height: 1.35;
    color: var(--navy);
    font-weight: 600;
    text-align: left;
    border-left: 1px solid var(--border);
    padding-left: 12px;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .industry-item-action-label {
    display: block;
    font-size: 7px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--gold);
    margin-bottom: 2px;
  }

  .page-industry .industry-intro {
    font-size: 12px;
    line-height: 1.55;
    margin-bottom: 12px;
  }

  .page-industry .industry-list {
    gap: 8px;
  }

  .page-industry .industry-item {
    padding: 10px 14px;
  }

  .page-industry .industry-item-name {
    font-size: 13px;
    margin-bottom: 3px;
  }

  .page-industry .industry-item-desc {
    font-size: 11px;
    line-height: 1.5;
  }

  .page-industry .industry-item-action {
    flex: 0 0 140px;
    font-size: 10.5px;
    line-height: 1.4;
    padding-left: 14px;
  }

  .page-industry .industry-item-action-label {
    font-size: 8px;
    margin-bottom: 3px;
  }

  .industry-card ul li:last-child {
    font-weight: 700;
    color: var(--navy);
    margin-top: 3px;
    padding-top: 3px;
    border-top: 1px solid var(--border);
  }

  /* ── SKILLS ── */
  .skills-layout {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 0;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 7px;
    flex: 0 0 auto;
  }

  .page-skills .skills-grid {
    gap: 9px;
  }

  .skill-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 7px 9px;
    border-top: 2px solid var(--navy);
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
    display: flex;
    flex-direction: column;
  }

  .page-skills .skill-card {
    padding: 8px 10px 9px;
  }

  .skill-card h3 {
    font-size: 11.5px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 4px;
    flex-shrink: 0;
  }

  .page-skills .skill-card h3 {
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }

  .skill-card ul { list-style: none; }
  .skill-card ul li {
    font-size: 10.5px;
    line-height: 1.38;
    color: #000000;
    padding: 1px 0 1px 9px;
    position: relative;
  }

  .page-skills .skill-card ul li {
    padding: 2.5px 0 2.5px 10px;
    line-height: 1.42;
  }
  .skill-card ul li::before {
    content: '';
    position: absolute;
    left: 0; top: 8px;
    width: 4px; height: 4px;
    background: var(--navy-mid);
    border-radius: 1px;
  }

  /* ── COLLEGE ── */
  .college-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    flex: 1;
  }

  /* ── DENSE PAGE LAYOUTS (13, 14, 18, 19) ── */
  .page-dense {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-height: 0;
  }

  .page-dense-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    flex: 1;
    align-content: start;
  }

  .page-dense-vertical {
    display: flex;
    flex-direction: column;
    gap: 9px;
    flex: 1;
    min-height: 0;
  }

  .page-dense-vertical > .card,
  .page-dense-vertical > .portfolio-card {
    width: 100%;
    flex: 0 0 auto;
    padding: 8px 12px 9px;
  }

  .page-dense-vertical > .card h3,
  .page-dense-vertical > .portfolio-card h3 {
    font-size: 11.5px;
    margin-bottom: 7px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--border);
  }

  .page-dense-vertical > .card ul,
  .page-dense-vertical > .portfolio-card ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
    row-gap: 1px;
  }

  .page-dense-vertical > .card ul li,
  .page-dense-vertical > .portfolio-card ul li {
    font-size: 10.5px;
    line-height: 1.45;
    padding: 2.5px 0 2.5px 10px;
  }

  .page-dense-vertical > .card-highlight ul {
    display: flex;
    flex-direction: column;
    grid-template-columns: unset;
  }

  .page-dense-vertical > .card-highlight ul li {
    font-size: 10.5px;
    line-height: 1.45;
    padding: 2.5px 0 2.5px 10px;
    color: rgba(255,255,255,0.85);
  }

  .page-dense-grid > .card,
  .page-dense-grid > .portfolio-card {
    padding: 8px 10px;
    border-radius: 8px;
    flex: 0 0 auto;
  }

  .page-dense-grid > .card h3,
  .page-dense-grid > .portfolio-card h3 {
    font-size: 11.5px;
    margin-bottom: 5px;
    gap: 5px;
  }

  .page-dense-grid > .card .card-icon {
    width: 16px;
    height: 16px;
    font-size: 11px;
  }

  .page-dense-grid > .card ul li,
  .page-dense-grid > .portfolio-card ul li {
    font-size: 10.8px;
    line-height: 1.42;
    padding: 1.5px 0 1.5px 10px;
  }

  .page-dense-bottom {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .page-dense-bottom.card,
  .page-dense-bottom > .card {
    padding: 8px 10px;
  }

  .page-dense-bottom.card ul li,
  .page-dense-bottom > .card ul li {
    font-size: 10.8px;
    line-height: 1.42;
    padding: 1.5px 0 1.5px 10px;
  }

  /* ── PORTFOLIO ── */
  .portfolio-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    flex: 1;
  }

  .portfolio-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .portfolio-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
  }

  .portfolio-card:nth-child(1)::after { background: var(--navy); }
  .portfolio-card:nth-child(2)::after { background: var(--gold); }
  .portfolio-card:nth-child(3)::after { background: var(--navy-light); }
  .portfolio-card:nth-child(4)::after { background: var(--success); }

  .portfolio-card h3 {
    font-size: 12.5px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 7px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .portfolio-card ul { list-style: none; }
  .portfolio-card ul li {
    font-size: 12px;
    line-height: 1.55;
    color: var(--slate);
    padding: 2.5px 0 2.5px 11px;
    position: relative;
  }
  .portfolio-card ul li::before {
    content: '';
    position: absolute;
    left: 0; top: 8px;
    width: 4px; height: 4px;
    border-radius: 1px;
    background: var(--gold);
  }

  /* ── RISKS ── */
  .risks-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    flex: 1;
  }

  .skills-adapt-card {
    flex: 0 0 auto !important;
    flex-grow: 0 !important;
    align-self: stretch;
    height: auto !important;
    min-height: 0 !important;
    padding: 6px 10px 7px !important;
    border-radius: 5px !important;
    margin-top: 0;
  }

  .skills-adapt-card h3 {
    font-size: 10px !important;
    margin-bottom: 5px !important;
    padding-bottom: 4px !important;
    border-bottom: 1px solid rgba(196,160,82,0.35) !important;
    gap: 4px !important;
    letter-spacing: 0.3px !important;
  }

  .skills-adapt-card .card-icon {
    width: 12px !important;
    height: 12px !important;
    font-size: 9.5px !important;
  }

  .skills-adapt-card ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 10px;
    row-gap: 2px;
    margin: 0;
    padding: 0;
  }

  .skills-adapt-card ul li {
    font-size: 9.5px !important;
    line-height: 1.35 !important;
    padding: 2px 0 2px 8px !important;
  }

  .skills-adapt-card ul li::before {
    top: 7px !important;
    width: 3px !important;
    height: 3px !important;
  }

  .page-skills .skills-layout {
    gap: 12px;
    justify-content: flex-start;
  }

  .page-skills .skills-adapt-card {
    margin-top: 2px;
  }

  /* ── TIMELINE PLANS ── */
  .page-plan-30 .plan-progress { margin-bottom: 14px; }

  .page-plan-30 .timeline-layout {
    gap: 10px;
    justify-content: flex-start;
  }

  .page-plan-30 .timeline-item { margin-bottom: 0; }

  .page-plan-30 .plan-extra-row {
    gap: 10px;
    margin-top: 4px;
  }

  .page-plan-30 .timeline-layout > .card-compact {
    margin-top: 4px;
  }

  .page-plan-30 .timeline-content {
    padding: 9px 12px;
  }

  .page-plan-30 .timeline-content ul li {
    padding: 2.5px 0 2.5px 10px;
  }

  .plan-progress {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .plan-step {
    flex: 1;
    text-align: center;
    position: relative;
  }

  .plan-step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--border);
    margin: 0 auto 4px;
    position: relative;
    z-index: 1;
  }

  .plan-step.active .plan-step-dot { background: var(--gold); box-shadow: 0 0 0 3px rgba(196,160,82,0.25); }
  .plan-step.done .plan-step-dot { background: var(--navy); }

  .plan-step-label { font-size: 10px; font-weight: 700; color: var(--slate-light); text-transform: uppercase; letter-spacing: 0.5px; }
  .plan-step.active .plan-step-label { color: var(--navy); }

  .plan-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 5px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: var(--border);
    z-index: 0;
  }

  .timeline-layout { display: flex; flex-direction: column; gap: 6px; flex: 1; }

  .timeline-item {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 10px;
    align-items: start;
  }

  .timeline-marker {
    background: var(--navy);
    color: #fff;
    border-radius: 8px;
    padding: 8px 6px;
    text-align: center;
    font-size: 10.5px;
    font-weight: 800;
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .timeline-content {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    border-left: 3px solid var(--gold);
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .plan-extra-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    flex-shrink: 0;
  }

  .timeline-content h4 {
    font-size: 12.5px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .timeline-content ul { list-style: none; }
  .timeline-content ul li {
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--slate);
    padding: 2px 0 2px 10px;
    position: relative;
  }
  .timeline-content ul li::before {
    content: '';
    position: absolute;
    left: 0; top: 8px;
    width: 4px; height: 4px;
    background: var(--gold);
    border-radius: 1px;
  }

  .plan-60-layout, .plan-90-layout {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
  }

  .plan-header-strip {
    background: var(--navy);
    color: #fff;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-align: center;
    flex-shrink: 0;
  }

  .plan-60-grid, .plan-90-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    flex: 1;
  }

  /* ── PARENT ── */
  .parent-layout {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
  }

  .parent-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    flex: 1;
  }

  /* ── FUTURE OUTLOOK ── */
  .outlook-hero {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .outlook-hero p {
    font-size: 13px;
    line-height: 1.7;
    color: rgba(255,255,255,0.8);
    font-style: italic;
  }

  .outlook-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    flex: 1;
  }

  /* ── BLUEPRINT ── */
  .page-blueprint .blueprint-layout {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    justify-content: flex-start;
  }

  .blueprint-hero {
    text-align: center;
    padding: 10px 0 14px;
    flex-shrink: 0;
  }

  .page-blueprint .blueprint-hero {
    padding: 6px 0 8px;
  }

  .blueprint-hero .bh-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--gold);
    font-weight: 700;
    margin-bottom: 4px;
  }

  .blueprint-hero .bh-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 25px;
    color: var(--navy);
  }

  .blueprint-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 7px;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .page-blueprint .blueprint-grid {
    gap: 10px;
    margin-bottom: 0;
  }

  .blueprint-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 12px;
    text-align: center;
    box-shadow: 0 1px 6px rgba(12,31,61,0.05);
  }

  .page-blueprint .blueprint-item {
    padding: 12px 10px;
  }

  .blueprint-item.featured {
    grid-column: span 1;
    background: var(--navy);
    border-color: var(--navy);
  }

  .blueprint-item .bi-label {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--gold);
    font-weight: 700;
    margin-bottom: 5px;
  }

  .blueprint-item .bi-value {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1.4;
  }

  .blueprint-item.featured .bi-label { color: var(--gold-light); }
  .blueprint-item.featured .bi-value { color: #fff; font-size: 14px; }

  .conclusion-box {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
    color: #fff;
    border-radius: 12px;
    padding: 16px 18px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    border: 1px solid rgba(196,160,82,0.3);
    position: relative;
    overflow: hidden;
    box-shadow: 0 3px 14px rgba(12,31,61,0.12);
  }

  .page-blueprint .conclusion-box {
    margin-top: 2px;
    padding: 14px 16px;
  }

  .blueprint-closing {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 14px;
  }

  .conclusion-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    background: var(--gold);
  }

  .conclusion-box p {
    font-size: 13px;
    line-height: 1.75;
    color: rgba(255,255,255,0.88);
    padding-left: 8px;
  }

  /* ── TAGS ── */
  .tag {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 4px;
    margin-left: 6px;
    vertical-align: middle;
  }

  .tag-gold {
    background: var(--gold);
    color: #ffffff;
    font-weight: 800;
  }

  .tag-blue {
    background: #2563eb;
    color: #ffffff;
    font-weight: 800;
  }

  .tag-gray {
    background: var(--surface-2);
    color: #475569;
    font-weight: 800;
    border: 1px solid #cbd5e1;
  }

  /* ── UTILITIES ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; }
  .flex-1 { flex: 1; }
  .mb-8 { margin-bottom: 8px; }
`;
