import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export function build(sel, props){
  const W=1200,H=620, svg=createSVG(sel,W,H);
  const sk=d3Sankey().nodeId(d=>d.name).nodeWidth(14).nodePadding(18).extent([[20,20],[W-20,H-20]]);
  const graph=sk({nodes:props.nodes.map(d=>({...d})),links:props.links.map(d=>({...d}))});
  const color=d3.scaleOrdinal().domain(props.nodes.map(d=>d.name)).range(d3.schemeTableau10);
  svg.append('g').selectAll('path').data(graph.links).join('path')
    .attr('d',d3SankeyLinkHorizontal()).attr('fill','none').attr('stroke',d=>d3.color(color(d.target.name)).formatHex())
    .attr('stroke-opacity',.65).attr('stroke-width',d=>Math.max(1,d.width))
    .on('mousemove',(ev,d)=>showTip(ev.pageX,ev.pageY,`${d.source.name} → ${d.target.name}<br/><strong>${d.value} MW</strong>`))
    .on('mouseleave',hideTip);
  const node=svg.append('g').selectAll('g').data(graph.nodes).join('g');
  node.append('rect').attr('x',d=>d.x0).attr('y',d=>d.y0).attr('width',d=>d.x1-d.x0).attr('height',d=>Math.max(1,d.y1-d.y0))
    .attr('fill',d=>color(d.name)).attr('opacity',.9);
  node.append('text').attr('x',d=>d.x0-8).attr('y',d=> (d.y0+d.y1)/2 ).attr('text-anchor','end').attr('dominant-baseline','middle')
    .attr('fill','var(--ink)').attr('font-weight',600).text(d=>d.name);
}
