import { REPORT_BULLET_CSS } from "../reportBullets";

export const reportStyles = `
  :root {
    --blue: #2563EB;
    --purple: #7C3AED;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    --slate-900: #0F172A;
    --slate-500: #64748B;
    --slate-50: #F8FAFC;
    --slate-100: #F1F5F9;
    --slate-200: #E2E8F0;
    --gradient-hero: linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #FFFFFF 100%);
    --gradient-accent: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
    --shadow-sm: 0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
    --shadow-md: 0 4px 16px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04);
    --shadow-lg: 0 10px 32px rgba(37,99,235,0.12), 0 4px 12px rgba(15,23,42,0.06);
    --radius: 18px;
    --radius-sm: 12px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 0; }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
    color: var(--slate-900);
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    height: 297mm;
    padding: 14mm 16mm 16mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    background: #ffffff;
  }
  .page:last-child { page-break-after: auto; }

  /* Page chrome */
  .page-top-bar {
    height: 4px;
    background: var(--gradient-accent);
    border-radius: 2px;
    margin-bottom: 10px;
  }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--slate-200);
  }
  .page-label {
    font-size: 8px;
    font-weight: 700;
    color: var(--blue);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .page-brand {
    font-size: 7px;
    font-weight: 600;
    color: var(--slate-500);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  h1 { font-size: 26px; font-weight: 800; color: var(--slate-900); line-height: 1.15; letter-spacing: -0.5px; }
  h2 { font-size: 18px; font-weight: 800; color: var(--slate-900); margin-bottom: 10px; line-height: 1.25; letter-spacing: -0.3px; }
  h3 { font-size: 11px; font-weight: 700; color: var(--slate-900); margin-bottom: 6px; letter-spacing: -0.1px; }
  h4 { font-size: 10px; font-weight: 700; color: var(--slate-900); margin-bottom: 4px; }
  p { font-size: 9.5px; line-height: 1.6; color: var(--slate-900); margin-bottom: 6px; }
  .subtitle { font-size: 11px; color: var(--slate-500); margin-bottom: 12px; font-weight: 500; }
  .page-subtitle { font-size: 10px; color: var(--slate-500); margin-bottom: 8px; font-weight: 500; line-height: 1.5; max-width: 420px; }

  /* Cards */
  .card {
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 10px 12px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 8px;
  }
  .card-primary { background: linear-gradient(135deg, #EFF6FF, #F8FAFC); border-color: #BFDBFE; }
  .card-purple { background: linear-gradient(135deg, #F5F3FF, #FAFAFE); border-color: #DDD6FE; }
  .card-success { background: linear-gradient(135deg, #ECFDF5, #F8FAFC); border-color: #A7F3D0; }
  .card-warning { background: linear-gradient(135deg, #FFFBEB, #F8FAFC); border-color: #FDE68A; }
  .card-danger { background: linear-gradient(135deg, #FEF2F2, #F8FAFC); border-color: #FECACA; }
  .card-insight { background: #fff; border-left: 4px solid var(--blue); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; box-shadow: var(--shadow-md); }
  .card-executive { background: linear-gradient(135deg, #0F172A, #1E293B); color: #fff; border: none; box-shadow: var(--shadow-lg); }
  .card-executive h3, .card-executive p, .card-executive li { color: #F8FAFC; }
  .card-executive li::before { color: #60A5FA; }
  .card-white { background: #fff; border: 1px solid var(--slate-200); border-radius: var(--radius-sm); padding: 10px; box-shadow: var(--shadow-sm); }
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .card-icon {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .card-icon-blue { background: #DBEAFE; color: var(--blue); }
  .card-icon-purple { background: #EDE9FE; color: var(--purple); }
  .card-icon-green { background: #D1FAE5; color: var(--success); }
  .card-icon-amber { background: #FEF3C7; color: var(--warning); }
  .card-icon-red { background: #FEE2E2; color: var(--danger); }
  .card-icon-dark { background: rgba(255,255,255,0.15); color: #fff; }

  /* Grids */
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .card-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
  .spaced-cards { gap: 10px; margin-bottom: 10px; }
  .quadrant-layout { gap: 10px; margin-bottom: 8px; }

  /* KPI stat cards */
  .stat-card {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 10px 8px;
    text-align: center;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--gradient-accent);
  }
  .stat-card-success::before { background: var(--success); }
  .stat-card-warning::before { background: var(--warning); }
  .stat-card-danger::before { background: var(--danger); }
  .stat-card-purple::before { background: var(--purple); }
  .stat-value { font-size: 18px; font-weight: 800; color: var(--slate-900); line-height: 1.1; }
  .stat-label { font-size: 7px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 3px; }

  /* Bullets */
  ${REPORT_BULLET_CSS}

  /* Progress */
  .progress-row { margin-bottom: 12px; }
  .progress-header {
    display: flex; justify-content: space-between;
    font-size: 9px; font-weight: 700; margin-bottom: 8px; color: var(--slate-900);
  }
  .progress-bar-bg { height: 7px; background: var(--slate-200); border-radius: 4px; overflow: hidden; }
  .progress-bar-fill { height: 100%; border-radius: 4px; background: var(--gradient-accent); }
  .progress-bar-fill-success { background: var(--success); }
  .progress-bar-fill-warning { background: var(--warning); }
  .progress-bar-fill-danger { background: var(--danger); }

  .meter-container { margin: 10px 0 14px; }
  .meter-container .progress-header { margin-bottom: 10px; }
  .meter-bg { height: 12px; background: var(--slate-200); border-radius: 6px; overflow: hidden; margin-bottom: 4px; }
  .meter-fill { height: 100%; border-radius: 6px; background: var(--gradient-accent); }
  .meter-container + p { margin-top: 10px; }

  .domain-scores-panel h3 { margin-bottom: 12px; }
  .domain-scores-list { margin-top: 2px; }
  .domain-scores-list .progress-row:last-child { margin-bottom: 8px; }

  /* Badge */
  .badge {
    display: inline-block;
    background: var(--gradient-accent);
    color: #fff;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  }
  .quadrant-badge-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 6px 0 10px;
  }
  .badge-quadrant {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.2;
    padding: 7px 18px;
    min-width: 132px;
    min-height: 24px;
  }

  /* Highlight / callout */
  .highlight-box {
    background: linear-gradient(135deg, #EFF6FF, #F5F3FF);
    border: 1px solid #BFDBFE;
    border-radius: var(--radius);
    padding: 10px 12px;
    margin: 8px 0;
    box-shadow: var(--shadow-md);
  }
  .highlight-box-dark {
    background: var(--gradient-accent);
    border: none;
    border-radius: var(--radius);
    padding: 10px 12px;
    margin: 8px 0;
    box-shadow: var(--shadow-lg);
  }
  .highlight-box-dark h3, .highlight-box-dark p { color: #fff; }
  .callout {
    background: #fff;
    border-left: 4px solid var(--purple);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 8px 10px;
    margin: 6px 0;
    box-shadow: var(--shadow-sm);
  }
  .divider { height: 1px; background: var(--slate-200); margin: 8px 0; }
  .section-divider {
    display: flex; align-items: center; gap: 8px;
    margin: 10px 0 8px;
    font-size: 8px; font-weight: 700;
    color: var(--slate-500); text-transform: uppercase; letter-spacing: 1.5px;
  }
  .section-divider::before, .section-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--slate-200);
  }

  /* Cover page */
  .cover-template-page {
    padding: 0 !important;
    overflow: hidden;
    position: relative;
    background: #0f172a;
  }
  .cover-page {
    background: var(--gradient-hero);
    display: flex; flex-direction: column;
    padding: 0 !important;
  }
  .cover-hero {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 20mm 16mm 10mm;
    position: relative;
  }
  .cover-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%);
  }
  .cover-hero::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%);
  }
  .cover-brand-bar {
    background: var(--gradient-accent);
    padding: 8px 16mm;
    display: flex; justify-content: space-between; align-items: center;
  }
  .cover-brand-text { font-size: 8px; font-weight: 700; color: #fff; letter-spacing: 2px; text-transform: uppercase; }
  .cover-title { font-size: 30px; font-weight: 800; color: var(--slate-900); margin-bottom: 4px; letter-spacing: -0.8px; position: relative; z-index: 1; }
  .cover-subtitle { font-size: 12px; color: var(--slate-500); margin-bottom: 20px; font-weight: 500; position: relative; z-index: 1; }

  .score-ring-wrap { position: relative; z-index: 1; margin: 16px 0; }
  .score-circle {
    width: 130px; height: 130px;
    border-radius: 50%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: #fff;
    box-shadow: var(--shadow-lg);
    position: relative;
  }
  .score-circle-value { font-size: 32px; font-weight: 800; color: var(--blue); line-height: 1; }
  .score-circle-label { font-size: 8px; font-weight: 700; color: var(--slate-500); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

  .cover-meta {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; width: 100%; max-width: 380px;
    margin: 14px auto 0; position: relative; z-index: 1;
  }
  .cover-meta-item {
    background: #fff;
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    border: 1px solid var(--slate-200);
    box-shadow: var(--shadow-sm);
    text-align: left;
  }
  .cover-meta-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--slate-500); }
  .cover-meta-value { font-size: 11px; font-weight: 700; color: var(--slate-900); margin-top: 2px; }

  .executive-statement {
    max-width: 400px; margin: 14px auto 0;
    font-size: 10px; line-height: 1.7;
    color: var(--slate-900);
    background: #fff;
    border-radius: var(--radius);
    padding: 12px 14px;
    border: 1px solid var(--slate-200);
    box-shadow: var(--shadow-md);
    font-style: italic;
    position: relative; z-index: 1;
  }
  .executive-statement::before {
    content: '"';
    font-size: 28px; font-weight: 800;
    color: var(--blue); line-height: 0;
    display: block; margin-bottom: 4px;
    font-style: normal;
  }
  .cover-footer {
    background: var(--slate-900);
    padding: 8px 16mm;
    text-align: center;
    font-size: 7px; color: #94A3B8;
    letter-spacing: 0.5px;
  }

  /* DNA cards */
  .dna-card {
    background: #fff;
    border-radius: var(--radius);
    padding: 10px 12px;
    border: 1px solid var(--slate-200);
    margin-bottom: 8px;
    box-shadow: var(--shadow-sm);
    border-top: 3px solid var(--blue);
  }
  .dna-card:nth-child(2) { border-top-color: var(--purple); }
  .dna-card:nth-child(3) { border-top-color: var(--success); }
  .dna-card:nth-child(4) { border-top-color: var(--warning); }

  /* Domain score cards */
  .domain-card {
    background: #fff;
    border-radius: var(--radius-sm);
    padding: 8px;
    border: 1px solid var(--slate-200);
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .domain-card-score { font-size: 16px; font-weight: 800; }
  .domain-card-name { font-size: 8px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; margin-top: 2px; }

  /* Strength medals */
  .strength-card {
    background: #fff;
    border-radius: var(--radius);
    padding: 10px 12px;
    border: 1px solid var(--slate-200);
    margin-bottom: 8px;
    box-shadow: var(--shadow-md);
    display: flex; gap: 10px;
  }
  .medal {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #fff;
    flex-shrink: 0;
  }
  .medal-gold { background: linear-gradient(135deg, #F59E0B, #D97706); box-shadow: 0 2px 8px rgba(245,158,11,0.4); }
  .medal-silver { background: linear-gradient(135deg, #94A3B8, #64748B); box-shadow: 0 2px 8px rgba(100,116,139,0.4); }
  .medal-bronze { background: linear-gradient(135deg, #CD7F32, #A0522D); box-shadow: 0 2px 8px rgba(205,127,50,0.4); }
  .strength-body { flex: 1; }

  /* Challenge cards */
  .challenge-card {
    background: #fff;
    border-radius: var(--radius);
    padding: 10px 12px;
    border: 1px solid #FECACA;
    margin-bottom: 8px;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid var(--danger);
  }
  .severity-bar {
    height: 4px; border-radius: 2px; margin-bottom: 6px;
    background: var(--slate-200);
  }
  .severity-fill { height: 100%; border-radius: 2px; background: var(--danger); }

  /* Risk vs Opportunity panels */
  .panel-risk {
    background: linear-gradient(135deg, #FEF2F2, #FFF);
    border: 1px solid #FECACA;
    border-radius: var(--radius);
    padding: 10px;
  }
  .panel-opportunity {
    background: linear-gradient(135deg, #ECFDF5, #FFF);
    border: 1px solid #A7F3D0;
    border-radius: var(--radius);
    padding: 10px;
  }
  .panel-recommend {
    background: linear-gradient(135deg, #EFF6FF, #FFF);
    border: 1px solid #BFDBFE;
    border-radius: var(--radius);
    padding: 10px;
  }

  /* Timeline / roadmap */
  .plan-block {
    background: var(--gradient-accent);
    border-radius: var(--radius);
    padding: 10px 12px;
    margin-bottom: 8px;
    color: #fff;
    box-shadow: var(--shadow-lg);
  }
  .plan-block h3, .plan-block p { color: #fff; }
  .timeline {
    display: flex; gap: 0; margin: 8px 0;
    position: relative;
  }
  .timeline::before {
    content: '';
    position: absolute;
    top: 14px; left: 20px; right: 20px;
    height: 2px; background: var(--slate-200);
  }
  .timeline-step {
    flex: 1; text-align: center; position: relative; z-index: 1;
  }
  .timeline-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--gradient-accent);
    color: #fff;
    font-size: 9px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 4px;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  }
  .timeline-label { font-size: 7px; font-weight: 700; color: var(--slate-500); text-transform: uppercase; }
  .timeline-item {
    border-left: 3px solid var(--blue);
    padding: 6px 0 6px 12px;
    margin-bottom: 8px;
    background: var(--slate-50);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }

  /* Insight mini cards */
  .insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .insight-mini {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-sm);
    padding: 8px;
    box-shadow: var(--shadow-sm);
  }
  .insight-mini-header {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 4px;
  }

  /* Stacked page sections */
  .layout-stack { display: flex; flex-direction: column; gap: 0; }
  .layout-stack > .detail-text { margin-bottom: 10px; }
  .layout-stack .layout-row { margin-bottom: 12px; }
  .layout-stack .layout-row:last-child { margin-bottom: 0; }
  .layout-stack .two-col.layout-row { gap: 12px; }
  .layout-stack .insight-grid.layout-row { gap: 10px; }
  .layout-stack .section-divider { margin: 4px 0 10px; }
  .layout-stack .card { margin-bottom: 0; }

  /* OS dashboard */
  .os-card {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 10px;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }
  .os-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: var(--gradient-accent);
  }

  /* Growth chart container */
  .chart-panel {
    background: var(--slate-50);
    border: 1px solid var(--slate-200);
    border-radius: var(--radius);
    padding: 10px;
    box-shadow: var(--shadow-sm);
    text-align: center;
  }
  .quadrant-chart-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .chart-panel .report-chart-svg,
  .quadrant-chart-wrap .report-chart-svg {
    display: block;
    width: 100%;
    max-width: 360px;
    height: auto;
    margin: 0 auto;
  }

  /* Page footer */
  .page-footer {
    position: absolute;
    bottom: 10mm; left: 16mm; right: 16mm;
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid var(--slate-200);
    padding-top: 6px;
  }
  .page-footer-brand { font-size: 7px; font-weight: 600; color: var(--slate-500); letter-spacing: 0.5px; }
  .page-num { font-size: 8px; font-weight: 700; color: var(--blue); }

  /* Checklist */
  /* Page content fill */
  .page-content { flex: 1; }
  .page-fill .card { margin-bottom: 7px; }
  .page-fill ul li { margin-bottom: 4px; font-size: 9px; line-height: 1.55; }
  .detail-text { font-size: 9px; line-height: 1.6; color: var(--slate-900); margin-bottom: 6px; }

  /* 90-day plan */
  .phase-header {
    display: flex; align-items: flex-start; gap: 10px;
    background: var(--gradient-accent);
    border-radius: var(--radius);
    padding: 10px 12px;
    margin-bottom: 8px;
    color: #fff;
    box-shadow: var(--shadow-lg);
  }
  .phase-header h3, .phase-header p { color: #fff; margin: 0; }
  .phase-header p { font-size: 9px; opacity: 0.9; margin-top: 2px; }
  .phase-badge {
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .week-plan-block {
    background: #fff;
    border: 1px solid var(--slate-200);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    margin-bottom: 7px;
    box-shadow: var(--shadow-sm);
    border-left: 3px solid var(--blue);
  }
  .week-plan-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 6px;
  }
  .week-badge {
    background: #DBEAFE;
    color: var(--blue);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 8px;
    font-weight: 800;
    white-space: nowrap;
  }
  .week-guidance {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed var(--slate-200);
  }
  .week-guidance h4 { color: var(--purple); }

  /* Radar legend */
  .radar-legend {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 12px;
    margin-top: 6px; padding: 6px 8px;
    background: var(--slate-50); border-radius: 8px; border: 1px solid var(--slate-200);
  }
  .radar-legend-item {
    font-size: 8px; font-weight: 700; color: var(--slate-900);
    display: inline-flex; align-items: center; gap: 4px;
  }
  .radar-legend-dot {
    width: 6px; height: 6px; border-radius: 50%; display: inline-block;
  }

  /* Quadrant position label */
  .quadrant-position-label {
    text-align: center;
    margin-top: 6px;
    padding: 5px 10px;
    background: #0F172A;
    border-radius: 6px;
    display: inline-block;
    width: 100%;
  }
  .qpl-title {
    display: block;
    font-size: 6.5px;
    font-weight: 600;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 2px;
  }
  .qpl-values {
    display: block;
    font-size: 8px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: 0.2px;
  }

  /* Compact cards */
  .card-compact {
    padding: 8px 10px !important;
    margin-bottom: 6px !important;
  }
  .card-compact h3 { font-size: 10px; margin-bottom: 4px; }
  .card-compact ul li { font-size: 8.5px; margin-bottom: 3px; line-height: 1.45; }
`;
