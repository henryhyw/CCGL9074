import { d3, topojson } from '../deps.js';
import { createSVG, dur, globalReveal } from '../core/utils.js';

export async function build(sel, props){
  await topojson;

  const W=1200, H=720;
  const svg = createSVG(sel, W, H);
  const g = svg.append('g'); // faded in globally

  const projection = d3.geoAlbersUsa().fitSize([W,H], {type:'Sphere'});
  const path = d3.geoPath(projection);

  const topo = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json());
  const states = window.topojson.feature(topo, topo.objects.states);

  g.append('path').datum({type:'Sphere'}).attr('d', path).attr('fill','rgba(255,255,255,.0)');
  g.selectAll('path.state').data(states.features).join('path')
    .attr('d', path)
    .attr('fill','rgba(255,255,255,.35)')
    .attr('stroke','rgba(255,255,255,.12)').attr('stroke-width',0.6);

  const nodeByName=new Map([...props.hubs, ...props.gens].map(n=>[n.name,n]));
  const lineGen=d3.line().curve(d3.curveBundle.beta(0.8));

  function arcPoints(a,b,curv=0.22){
    const A=projection([a.lon,a.lat]), B=projection([b.lon,b.lat]);
    if(!A||!B) return null;
    const mx=(A[0]+B[0])/2, my=(A[1]+B[1])/2;
    const dx=B[0]-A[0], dy=B[1]-A[1], nx=-dy, ny=dx;
    const len=Math.hypot(dx,dy); const k=curv*len;
    const C=[mx+nx/len*k, my+ny/len*k];
    return [A,C,B];
  }

  const edgeG = g.append('g').attr('fill','none');
  const arcs = props.edges.map(([sName,tName,mag])=>{
    const s=nodeByName.get(sName), t=nodeByName.get(tName);
    const pts=arcPoints(s,t,0.22); if(!pts) return null;
    const color=d3.interpolateWarm(.15+mag*.35);
    const pathEl=edgeG.append('path')
      .attr('d',lineGen(pts))
      .attr('stroke',color)
      .attr('stroke-width',1+mag*4)
      .attr('stroke-opacity',.9)
      .attr('stroke-linecap','round')
      .attr('stroke-dasharray','4 6')
      .attr('stroke-dashoffset',60);
    return {pathEl,mag};
  }).filter(Boolean);

  const nodeG = g.append('g');

  // Initial small dots
  const gens = nodeG.selectAll('circle.gen').data(props.gens).join('circle')
    .attr('class','gen')
    .attr('cx',d=>projection([d.lon,d.lat])?.[0])
    .attr('cy',d=>projection([d.lon,d.lat])?.[1])
    .attr('r',1)
    .attr('fill','#fff');

  const hubs = nodeG.selectAll('circle.hub').data(props.hubs).join('circle')
    .attr('class','hub')
    .attr('cx',d=>projection([d.lon,d.lat])?.[0])
    .attr('cy',d=>projection([d.lon,d.lat])?.[1])
    .attr('r',1.5)
    .attr('fill','var(--brand)');

  nodeG.selectAll('text.lbl').data([...props.hubs,...props.gens]).join('text')
    .attr('class','lbl')
    .attr('x',d=>projection([d.lon,d.lat])?.[0]+6)
    .attr('y',d=>projection([d.lon,d.lat])?.[1]-6)
    .attr('fill','var(--ink)')
    .attr('font-size','var(--fs-geoLabel, 12px)')
    .attr('font-weight',600)
    .text(d=>d.name);

  let motionTimer = null;
  function startMotion(){
    if(motionTimer) return;
    motionTimer = d3.timer((t)=>{
      arcs.forEach(a=>{
        a.pathEl.attr('stroke-dashoffset', 60 - (t/60)*(1 + a.mag*1.5));
      });
    });
  }

  // Global fade, then animate nodes & start motion
  globalReveal({
    container: sel,
    fadeSel: g,
    ease: d3.easeCubicOut,
    fadeMs: dur(700),
    animateFinal(){
      gens.transition().duration(dur(600)).attr('r',3.5);
      hubs.transition().duration(dur(600)).attr('r',4.5);
      startMotion();
    }
  });
}
