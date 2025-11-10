import { d3 } from '../deps.js';
import { createSVG, dur, dly, globalReveal } from '../core/utils.js';

export function build(sel, props){
  const W=1200,H=700,M={t:40,r:40,b:72,l:82};
  const svg=createSVG(sel,W,H);
  const g=svg.append('g').attr('transform',`translate(${M.l},${M.t})`);  // faded in globally

  const innerW=W-M.l-M.r, innerH=H-M.t-M.b;
  const X = d3.extent(props.seriesA, d=>d.x);
  const Y = [0, d3.max([d3.max(props.seriesA,d=>d.y), d3.max(props.seriesB,d=>d.y)])*1.1];
  const x=d3.scaleLinear().domain(X).range([0,innerW]);
  const y=d3.scaleLinear().domain(Y).nice().range([innerH,0]);

  g.append('g').attr('transform',`translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')).tickSize(-innerH))
    .call(g=>g.selectAll('text').attr('fill','var(--muted)'))
    .call(g=>g.selectAll('line,path').attr('stroke','var(--gridline)'));

  g.append('g')
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerW))
    .call(g=>g.selectAll('text').attr('fill','var(--muted)'))
    .call(g=>g.selectAll('line,path').attr('stroke','var(--gridline)'));

  g.append('text').attr('class','axis-title').attr('x',innerW/2).attr('y',innerH+56).attr('text-anchor','middle')
    .text(props.xLabel||'Year');
  g.append('text').attr('class','axis-title').attr('transform',`translate(${-54},${innerH/2}) rotate(-90)`)
    .attr('text-anchor','middle').text(props.yLabel||'MW');

  const line=d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveMonotoneX);
  const area=d3.area().x(d=>x(d.x)).y0(d=>y(props.seriesB.find(c=>c.x===d.x).y)).y1(d=>y(d.y)).curve(d3.curveMonotoneX);

  const gapArea = (props.fillGap!==false)
    ? g.append('path').datum(props.seriesA).attr('d',area).attr('fill','rgba(239,93,96,0.18)').attr('opacity',0)
    : null;

  const p1=g.append('path').datum(props.seriesA).attr('d',line).attr('fill','none').attr('stroke',props.colorA||'var(--danger)').attr('stroke-width',3);
  const p2=g.append('path').datum(props.seriesB).attr('d',line).attr('fill','none').attr('stroke',props.colorB||'var(--brand-2)').attr('stroke-width',3);

  // Prepare dash for later animation
  [p1,p2].forEach(p=>{
    const L=p.node().getTotalLength();
    p.attr('stroke-dasharray',`${L} ${L}`).attr('stroke-dashoffset',L);
  });

  globalReveal({
    container: sel,
    fadeSel: g,
    ease: d3.easeCubicOut,
    fadeMs: dur(700),
    animateFinal(){
      if(gapArea){
        gapArea.transition().delay(dly(500)).duration(dur(1200)).attr('opacity',1);
      }
      [p1,p2].forEach(p=>{
        const L=p.node().getTotalLength();
        p.transition().duration(dur(2200)).ease(d3.easeCubicOut).attr('stroke-dashoffset',0);
      });
    }
  });
}
