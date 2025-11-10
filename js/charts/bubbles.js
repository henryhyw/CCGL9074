import { d3, topojson } from '../deps.js';
import { createSVG, dur, dly, showTip, hideTip, globalReveal } from '../core/utils.js';

export async function build(sel, props){
  await topojson;

  const W=1200, H=720;
  const svg = createSVG(sel, W, H);
  const g = svg.append('g');                       // faded in globally

  const projection = d3.geoAlbersUsa().fitSize([W,H], {type:'Sphere'});
  const path = d3.geoPath(projection);

  const topo = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json());
  const states = window.topojson.feature(topo, topo.objects.states);

  g.append('path').datum({type:'Sphere'}).attr('d', path).attr('fill','rgba(255,255,255,.0)');
  g.selectAll('path.state').data(states.features).join('path')
    .attr('d', path)
    .attr('fill','rgba(255,255,255,.35)')
    .attr('stroke','rgba(255,255,255,.12)').attr('stroke-width',0.6);

  const valueKey = props.valueKey || 'inc';
  const r = d3.scaleSqrt()
    .domain([0, d3.max(props.metros, d=>d[valueKey])])
    .range(props.rRange || [6,36]);

  const nodes = g.append('g').selectAll('g.m')
    .data(props.metros)
    .join('g')
    .attr('class','m')
    .attr('transform', d => `translate(${projection([d.lon,d.lat])})`);

  const r0 = d => Math.max(3, r(d[valueKey]) * 0.25);  // initial (small) size

  const circles = nodes.append('circle')
    .attr('r', d => r0(d))
    .attr('fill','rgba(247,178,103,.25)')
    .attr('stroke','rgba(247,157,101,1)')
    .attr('stroke-width',1.6);

  const labels = nodes.append('text')
    .attr('y', d => -r0(d) - 6)
    .attr('text-anchor','middle')
    .attr('fill','var(--ink)')
    .attr('font-weight',600)
    .attr('font-size','var(--fs-geoLabel, 14px)')
    .text(d => (props.labelFmt ? props.labelFmt(d) : `${d.name} · ${d[valueKey]}`) );

  const pts = props.metros;
  svg.on('mousemove',(ev)=>{
    const [mx,my]=d3.pointer(ev);
    const hit=d3.least(pts, d=>{
      const p=projection([d.lon,d.lat]); if(!p) return 1e9;
      return Math.hypot(p[0]-mx,p[1]-my)-r(d[valueKey]);
    });
    const p=projection([hit.lon,hit.lat]);
    const dist=p?Math.hypot(p[0]-mx,p[1]-my):1e9;
    if(dist<r(hit[valueKey])+8){
      showTip(ev.pageX,ev.pageY,`<strong>${hit.name}</strong><br/>${hit[valueKey]}`);
    }else{
      hideTip();
    }
  }).on('mouseleave', hideTip);

  // Global fade, then animate to final state
  globalReveal({
    container: sel,
    fadeSel: g,
    ease: d3.easeCubicOut,
    fadeMs: dur(700),
    animateFinal(){
      circles.transition().duration(dur(1600)).ease(d3.easeCubicOut)
        .attr('r', d => r(d[valueKey]));
      labels.transition().duration(dur(1200)).ease(d3.easeCubicOut)
        .attr('y', d => -r(d[valueKey]) - 6);
    }
  });
}
