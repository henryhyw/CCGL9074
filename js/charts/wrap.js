import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export function build(sel, props){
  const wrap=document.querySelector(sel);
  wrap.innerHTML = `
    <div class="verdict-grid" id="verdict-grid">
      <div class="verdict-card" id="card-gains"><h4><span class="icon-chip"><i class="fa-solid fa-chart-line"></i></span> Gains</h4><ul><li>Capex & construction jobs</li><li>Long-term tax base</li><li>Digital spillovers</li></ul></div>
      <div class="verdict-card" id="card-costs"><h4><span class="icon-chip"><i class="fa-solid fa-triangle-exclamation"></i></span> Costs</h4><ul><li>Upgrade delays & queues</li><li>Water in arid metros</li><li>Peaker reliance & local air</li></ul></div>
      <div class="verdict-card" id="card-fix"><h4><span class="icon-chip"><i class="fa-solid fa-plug-circle-bolt"></i></span> Fix the bottleneck</h4><ul><li>“Speed-to-Power” fast-tracks</li><li>On-site hybrids (storage + firm)</li><li>Tax policy tied to EJ & water</li></ul></div>
    </div>`;
}
