import { d3, topojson } from '../deps.js';
import { createSVG, dur, globalReveal } from '../core/utils.js';

export async function build(sel, props){
  await topojson;

  const W=1200, H=720;
  const svg=createSVG(sel,W,H);
  const g=svg.append('g');     // faded in globally

  const projection=d3.geoAlbersUsa().fitSize([W,H],{type:'Sphere'});
  const path=d3.geoPath(projection);

  const topo=await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json());
  const states=window.topojson.feature(topo, topo.objects.states);

  g.append('path').datum({type:'Sphere'}).attr('d',path).attr('fill','rgba(255,255,255,.03)');
  g.selectAll('path.state').data(states.features).join('path')
    .attr('d',path)
    .attr('fill','rgba(255,255,255,.04)')
    .attr('stroke','rgba(255,255,255,.10)').attr('stroke-width',0.6);

  const pts=props.points.map(m=>({ ...m, proj: projection([m.lon,m.lat]) }));
  const spacing=40, hexR=14, cols=Math.ceil(W/spacing)+2, rows=Math.ceil(H/(spacing*0.86))+2;

  const centers=[];
  for(let r=0;r<rows;r++){
    const y=r*spacing*0.86; const xoff=(r%2)*spacing/2;
    for(let c=0;c<cols;c++){ const x=c*spacing + xoff; centers.push({x,y, values:[]}); }
  }

  pts.forEach(p=>{
    centers.forEach(c=>{
      const d=Math.hypot(c.x-p.proj[0], c.y-p.proj[1]);
      if(d<80) c.values.push(p.burden);
    });
  });

  const v=d=>d.values.length? d3.mean(d.values):0;
  const maxB=d3.max(centers, v)||1;
  const color=d3.scaleLinear().domain([0, maxB*0.5, maxB]).range(['#20334f','#f7dda6','#ef5d60']);

  const hexPath=(cx,cy,r)=>{
    const a=Math.PI/3;
    const pts=d3.range(6).map(i=>[cx+r*Math.cos(a*i), cy+r*Math.sin(a*i)]);
    return d3.line()(pts)+ 'Z';
  };

  const hexes = g.append('g').selectAll('path.hex').data(centers).join('path')
    .attr('class','hex')
    .attr('d',d=>hexPath(d.x,d.y,hexR))
    .attr('fill', d=>color(0))              // initial
    .attr('stroke','rgba(255,255,255,.06)')
    .attr('opacity', .95);

  g.append('g').selectAll('text.mlbl').data(pts).join('text')
    .attr('class','mlbl')
    .attr('x',d=>d.proj[0]+8)
    .attr('y',d=>d.proj[1]-8)
    .attr('fill','var(--ink)')
    .attr('font-size','var(--fs-geoLabel, 12px)')
    .attr('font-weight',600)
    .text(d=> props.labelFmt ? props.labelFmt(d) : `${d.name} · ${d.burden.toFixed(2)}%`);

  globalReveal({
    container: sel,
    fadeSel: g,
    ease: d3.easeCubicOut,
    fadeMs: dur(700),
    animateFinal(){
      hexes.transition()
        .delay((_,i)=> (i%cols) * 8)  // gentle diagonal wave
        .duration(dur(800))
        .attr('fill', d=>color(v(d)));
    }
  });
}
