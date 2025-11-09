import { d3, topojson, d3Sankey, d3SankeyLinkHorizontal } from '../deps.js';
import { createSVG, dur, dly, clamp, select, showTip, hideTip } from '../core/utils.js';

export async function build(sel, props){
  await topojson;
  const W=1200,H=700;
  const svg=createSVG(sel,W,H), g=svg.append('g');
  const projection=d3.geoAlbersUsa().fitSize([W,H],{type:'Sphere'});
  const path=d3.geoPath(projection);
  const topo=await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json());
  const states=window.topojson.feature(topo, topo.objects.states);
  const color=d3.scaleLinear().domain([0,.5,1]).range(['#3aa0ff','#f0e68c','#e34a33']);
  const sval = name => (props.stressByState?.[name] ?? .25);
  const st = g.selectAll('path.state').data(states.features).join('path')
    .attr('class','state')
    .attr('d',path)
    .attr('fill', '#1a2638')
    .attr('stroke','rgba(255,255,255,.12)')
    .attr('stroke-width',0.6);
  st.transition().delay((d,i)=>dly(24*i)).duration(dur(900)).attr('fill',d=>color(sval(d.properties.name)));
  st.append('title').text(d=>`${d.properties.name} • stress ${(sval(d.properties.name)*100|0)}pctl`);
  const dry = states.features.filter(f => sval(f.properties.name) >= 0.75);
  const rings = g.append('g').attr('class','dry-rings').selectAll('path').data(dry).join('path')
    .attr('d',path).attr('fill','none').attr('stroke','#e34a33').attr('stroke-opacity',0.85).attr('stroke-width',1.8).attr('stroke-linecap','round').attr('stroke-dasharray','6 8');
  d3.timer(t => { const sp = 70; rings.attr('stroke-dashoffset', -(t / sp)); });
}
