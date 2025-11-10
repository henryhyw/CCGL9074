import { d3 } from '../deps.js';
import { createSVG, dur, globalReveal } from '../core/utils.js';

export function build(sel, props){
  const W=1200, H=600, M={t:40,r:40,b:70,l:80};
  const svg=createSVG(sel,W,H);
  const g=svg.append('g').attr('transform',`translate(${M.l},${M.t})`); // globally faded

  const innerW=W-M.l-M.r, innerH=H-M.t-M.b, pts = props.points;
  const x=d3.scaleLinear().domain(d3.extent(pts,d=>d.x)).range([0,innerW]);
  const y=d3.scaleLinear().domain([0,d3.max(pts,d=>d.y)*1.2]).range([innerH,0]).nice();

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
  g.append('text').attr('class','axis-title').attr('transform',`translate(${-50},${innerH/2}) rotate(-90)`).attr('text-anchor','middle')
    .text(props.yLabel||'¢/kWh');

  const line=d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveMonotoneX);
  const curve=g.append('path').datum(pts)
    .attr('d',line)
    .attr('fill','none')
    .attr('stroke','var(--brand)')
    .attr('stroke-width',3);

  // Prepare path drawing
  const L=curve.node().getTotalLength();
  curve.attr('stroke-dasharray',`${L} ${L}`).attr('stroke-dashoffset',L);

  // Marker starts at the beginning of the path
  const p0 = curve.node().getPointAtLength(0);
  const marker=g.append('circle')
    .attr('r',5)
    .attr('fill','var(--accent)')
    .style('opacity',0)
    .attr('cx', p0.x)
    .attr('cy', p0.y);

  globalReveal({
    container: sel,
    fadeSel: g,
    fadeMs: dur(700),
    ease: d3.easeCubicOut,
    animateFinal(){
      curve.transition()
        .duration(dur(2200))
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
        .on('start', () => marker.style('opacity',1))
        .tween('marker-follow', function(){
          const path = this;
          return function(t){
            // t is already eased; keep marker at the end of the visible segment
            const p = path.getPointAtLength(L * t);
            marker.attr('cx', p.x).attr('cy', p.y);
          };
        });
    }
  });
}
