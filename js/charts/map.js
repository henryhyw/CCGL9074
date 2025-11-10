import { d3, topojson } from '../deps.js';
import { createSVG, dur, showTip, hideTip, globalReveal } from '../core/utils.js';

export async function build(sel, props){
  await topojson;

  const W=1200, H=700;
  const svg = createSVG(sel, W, H);
  const root = svg.append('g');            // will be faded in globally

  const projection = d3.geoAlbersUsa().fitSize([W,H], {type:'Sphere'});
  const path = d3.geoPath(projection);
  const topo = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json());
  const states = window.topojson.feature(topo, topo.objects.states);

  root.append('path').datum({type:'Sphere'}).attr('d', path).attr('fill','rgba(255,255,255,.0)');
  root.selectAll('path.state')
    .data(states.features).join('path')
    .attr('class','state').attr('d', path)
    .attr('fill','rgba(255,255,255,.35)')
    .attr('stroke','rgba(255,255,255,.12)').attr('stroke-width',0.6);

  const scale = d3.scaleSqrt()
    .domain([0, d3.max(props.clusters, d=>d.mw)])
    .range([6,58]);

  const bubbles = root.append('g').selectAll('g.b')
    .data(props.clusters).join('g')
    .attr('class','b')
    .attr('transform', d => `translate(${projection([d.lon, d.lat])})`);

  // INITIAL state (small radius)
  const circles = bubbles.append('circle')
    .attr('r', d => Math.max(3, scale(d.mw)*0.25))
    .attr('fill','rgba(123,223,242,.25)')
    .attr('stroke','rgba(123,223,242,.9)').attr('stroke-width',1.6);

  bubbles.append('text')
    .attr('y', d => -scale(d.mw)*0.18 - 6)
    .attr('text-anchor','middle')
    .attr('fill','var(--ink)')
    .attr('font-weight',600)
    .style('font-size','var(--fs-geoLabel, 14px)')
    .text(d => d.name);

  const pts = props.clusters;
  svg.on('mousemove',(ev)=>{
    const [mx,my]=d3.pointer(ev);
    const hit=d3.least(pts, d=>{
      const p=projection([d.lon,d.lat]); if(!p) return 1e9;
      return Math.hypot(p[0]-mx,p[1]-my)-scale(d.mw);
    });
    const p=projection([hit.lon,hit.lat]); const dist=p?Math.hypot(p[0]-mx,p[1]-my):1e9;
    if(dist<scale(hit.mw)+10) showTip(ev.pageX,ev.pageY,`<strong>${hit.name}</strong><br/>~${hit.mw.toLocaleString()} MW`); else hideTip();
  }).on('mouseleave', hideTip);

  // ▶ Global fade, THEN animate to final state
  globalReveal({
    container: sel,
    fadeSel: root,
    ease: d3.easeCubicOut,
    fadeMs: dur(700),
    threshold: 0.45,
    animateFinal(){
      circles.transition().duration(dur(1400)).ease(d3.easeCubicOut)
        .attr('r', d => scale(d.mw));
      // If you have other transitions (lines growing, bars rising), put them here too.
    }
  });
}
