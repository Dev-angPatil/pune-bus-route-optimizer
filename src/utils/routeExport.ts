import { OptimizationComparison } from '../types/transit';

/**
 * Generates an official, print-ready Pune PMPML transit optimization slip
 * and triggers an immediate print/PDF save dialog in the browser.
 */
export function exportRouteSlip(comparison: OptimizationComparison): void {
  const std = comparison.standard_route;
  const opt = comparison.crowd_optimized_route;
  const m = comparison.metrics;
  const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download your route summary slip.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>PMPML Route Optimization Summary - ${comparison.origin} to ${comparison.destination}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand h1 {
      margin: 0;
      font-size: 22px;
      color: #0369a1;
      letter-spacing: -0.5px;
    }
    .brand p {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #64748b;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    .trip-banner {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .trip-route {
      font-size: 16px;
      font-weight: 700;
      color: #0c4a6e;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .kpi-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: 800;
      color: #0369a1;
      font-family: monospace;
    }
    .kpi-sub {
      font-size: 11px;
      color: #16a34a;
      font-weight: 600;
      margin-top: 2px;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    .comparison-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      color: #334155;
    }
    .comparison-table td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
    }
    .segments-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .segments-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 24px;
    }
    .segments-table th {
      background: #0284c7;
      color: #ffffff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
    }
    .segments-table td {
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 10px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
    .print-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>

  <div class="header">
    <div class="brand">
      <h1>🚌 Pune Bus Route Optimizer (PMPML)</h1>
      <p>Dynamic Congestion Avoidance & Multi-Modal Transit Guidance</p>
    </div>
    <div class="meta-box">
      <div><strong>Report Generated:</strong> ${generatedAt}</div>
      <div><strong>Commute Hour:</strong> ${comparison.simulation_hour}</div>
      <div><strong>System Status:</strong> Live AI Optimization Active</div>
    </div>
  </div>

  <div class="trip-banner">
    <div>
      <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: 700;">Optimized Transit Corridor</div>
      <div class="trip-route">${comparison.origin} ➔ ${comparison.destination}</div>
    </div>
    <div style="text-align: right;">
      <span style="background: #16a34a; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">
        ${m.time_saved_percentage}% FASTER
      </span>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-title">Time Saved</div>
      <div class="kpi-value">${m.time_saved_minutes} min</div>
      <div class="kpi-sub">${m.time_saved_percentage}% reduction</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Est. Travel Time</div>
      <div class="kpi-value">${opt.estimated_travel_time_mins} min</div>
      <div style="font-size: 11px; color: #64748b;">vs ${std.estimated_travel_time_mins} min std</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Avg Crowd Exposure</div>
      <div class="kpi-value" style="color: #d97706;">${opt.average_crowd_exposure_percent}%</div>
      <div class="kpi-sub" style="color: #16a34a;">-${m.crowd_reduction_percentage}% cleaner</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">CO₂ Saved</div>
      <div class="kpi-value" style="color: #059669;">${m.co2_saved_kg > 0 ? m.co2_saved_kg : 0} kg</div>
      <div style="font-size: 11px; color: #64748b;">Green Transit</div>
    </div>
  </div>

  <table class="comparison-table">
    <thead>
      <tr>
        <th>Performance Metric</th>
        <th>Standard Dijkstra (Congested)</th>
        <th>AI Crowd-Adaptive Route</th>
        <th>Net Benefit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Total Distance</strong></td>
        <td>${std.total_distance_km} km</td>
        <td>${opt.total_distance_km} km</td>
        <td>+${m.distance_overhead_km} km (Strategic Detour)</td>
      </tr>
      <tr>
        <td><strong>Transit Travel Time</strong></td>
        <td>${std.estimated_travel_time_mins} mins</td>
        <td><strong>${opt.estimated_travel_time_mins} mins</strong></td>
        <td style="color: #16a34a; font-weight: 700;">-${m.time_saved_minutes} mins saved</td>
      </tr>
      <tr>
        <td><strong>Congestion Delay</strong></td>
        <td>+${std.congestion_delay_mins} mins</td>
        <td>+${opt.congestion_delay_mins} mins</td>
        <td style="color: #16a34a; font-weight: 700;">Bypasses major chokepoints</td>
      </tr>
      <tr>
        <td><strong>Average Stop Crowd</strong></td>
        <td>${std.average_crowd_exposure_percent}%</td>
        <td><strong>${opt.average_crowd_exposure_percent}%</strong></td>
        <td style="color: #16a34a; font-weight: 700;">-${m.crowd_reduction_percentage}% less congestion</td>
      </tr>
    </tbody>
  </table>

  <div class="segments-title">📍 Turn-by-Turn Route Navigation (${opt.segments.length} stops)</div>
  <table class="segments-table">
    <thead>
      <tr>
        <th style="width: 35px;">#</th>
        <th>Corridor Segment</th>
        <th>Distance</th>
        <th>Travel Time</th>
        <th>Crowd Index</th>
        <th>Corridor Status</th>
      </tr>
    </thead>
    <tbody>
      ${opt.segments
        .map(
          (seg, i) => `
        <tr>
          <td><strong>${i + 1}</strong></td>
          <td><strong>${seg.from}</strong> ➔ <strong>${seg.to}</strong></td>
          <td>${seg.distance_km} km</td>
          <td>${seg.travel_time_mins} mins</td>
          <td>${Math.round(seg.crowd_index * 100)}%</td>
          <td>${
            seg.is_chokepoint
              ? '<span style="color: #dc2626; font-weight: 600;">Bottleneck Avoided</span>'
              : '<span style="color: #16a34a; font-weight: 600;">Clear Flow</span>'
          }</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Pune Bus Route Optimizer • Developed for Academic Demonstration & PMPML Transit Planning</p>
    <p>Powered by Real-World PMPML Geospatial Data & Dynamic Calibrated ML Demand Prediction</p>
  </div>

  <script>
    // Automatically trigger print dialog on page load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

