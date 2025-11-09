import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export function build(sel, props){
  const W=1200,H=600,M={t:40,r:40,b:70,l:80},svg=createSVG(sel,W,H),g=svg.append('g').attr('transform',`translate(${M.l},${M.t})`);
  const innerW=W-M.l-M.r, innerH=H-M.t-M.b, pts = props.points;
  const x=d3.scaleLinear().domain(d3.extent(pts,d=>d.x)).range([0,innerW]);
  const y=d3.scaleLinear().domain([0,d3.max(pts,d=>d.y)*1.2]).range([innerH,0]).nice();
  g.append('g').attr('transform',`translate(0,${innerH})`).call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')).tickSize(-innerH))
   .call(g=>g.selectAll('text').attr('fill','var(--muted)')).call(g=>g.selectAll('line,path').attr('stroke','var(--gridline)'));
  g.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-innerW))
   .call(g=>g.selectAll('text').attr('fill','var(--muted)')).call(g=>g.selectAll('line,path').attr('stroke','var(--gridline)'));
  g.append('text').attr('class','axis-title').attr('x',innerW/2).attr('y',innerH+56).attr('text-anchor','middle').text(props.xLabel||'Year');
  g.append('text').attr('class','axis-title').attr('transform',`translate(${-50},${innerH/2}) rotate(-90)`).attr('text-anchor','middle').text(props.yLabel||'¢/kWh');
  const line=d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveMonotoneX);
  const curve=g.append('path').datum(pts).attr('d',line).attr('fill','none').attr('stroke','var(--brand)').attr('stroke-width',3);
  const L=curve.node().getTotalLength(); curve.attr('stroke-dasharray',`${L} ${L}`).attr('stroke-dashoffset',L).transition().duration(dur(2200)).attr('stroke-dashoffset',0);
  const marker=g.append('circle').attr('r',5).attr('fill','var(--accent)').style('opacity',0);
  const T=d3.timer((elapsed)=>{
    const t=Math.min(1, elapsed/dur(2600));
    const len=L*t;
    const p=curve.node().getPointAtLength(len);
    marker.style('opacity',1).attr('cx',p.x).attr('cy',p.y);
    if(t>=1) T.stop();
  });
}
