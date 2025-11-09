import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export async function build(sel, props){
  await topojson;
  const W=1200,H=720, svg=createSVG(sel,W,H), defs=svg.append('defs'), g=svg.append('g');
  const projection=d3.geoAlbersUsa().fitSize([W,H],{type:'Sphere'}), path=d3.geoPath(projection);
  const topo=await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json()), states=window.topojson.feature(topo, topo.objects.states);
  g.append('path').datum({type:'Sphere'}).attr('d',path).attr('fill','rgba(255,255,255,.0)');
  g.selectAll('path.state').data(states.features).join('path').attr('d',path).attr('fill','rgba(255,255,255,.35)').attr('stroke','rgba(255,255,255,.12)').attr('stroke-width',0.6);
  props.sites.forEach((s,i)=>{
    const id=`rg${i}`; const grad=defs.append('radialGradient').attr('id',id);
    grad.append('stop').attr('offset','0%').attr('stop-color','rgba(255,255,255,.9)');
    grad.append('stop').attr('offset','100%').attr('stop-color','rgba(255,255,255,0)');
    const p=projection([s.lon,s.lat]);
    const r=40 + s.disp*60;
    g.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',r).attr('fill',`url(#${id})`)
      .attr('stroke',d3.interpolatePlasma(s.ej*.8)).attr('stroke-opacity',.5).attr('stroke-dasharray','6 8').attr('stroke-width',1.5)
      .transition().duration(dur(2200)).attrTween('stroke-dashoffset',()=>t=>`${(1-t)*20}`);
    g.append('text').attr('x',p[0]+r/2+6).attr('y',p[1]-r/2-6).attr('fill','var(--ink)').attr('font-size',12).attr('font-weight',600)
      .text(`${s.name} · EJ ${Math.round(s.ej*100)}pctl`);
  });
}
