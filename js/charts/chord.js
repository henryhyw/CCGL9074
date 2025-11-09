import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export function build(sel, props){
  const W=1000,H=680, R=Math.min(W,H)/2 - 60, svg=createSVG(sel,W,H);
  const g=svg.append('g').attr('transform',`translate(${W/2},${H/2})`);
  const chords=d3.chord().padAngle(0.04).sortSubgroups(d3.descending)(props.matrix);
  const color=d3.scaleOrdinal().domain(props.names).range(d3.schemeTableau10.concat(d3.schemeSet2).slice(0,props.names.length));
  const group=g.append('g').selectAll('g').data(chords.groups).join('g');
  group.append('path').attr('d',d3.arc().innerRadius(R).outerRadius(R+18)).attr('fill',d=>color(props.names[d.index])).attr('opacity',.95);
  group.append('text').each(d=>{d.angle=(d.startAngle+d.endAngle)/2;})
    .attr('dy','0.35em')
    .attr('transform',d=>`rotate(${d.angle*180/Math.PI-90}) translate(${R+24}) ${d.angle>Math.PI? 'rotate(180)':''}`)
    .attr('text-anchor',d=>d.angle>Math.PI?'end':null).attr('fill','var(--ink)').attr('font-size',12).attr('font-weight',600)
    .text(d=>props.names[d.index]);
  g.append('g').attr('fill-opacity',0.9).selectAll('path').data(chords).join('path')
    .attr('d',d3.ribbon().radius(R)).attr('fill',d=>color(props.names[d.source.index])).attr('stroke','none');
}
