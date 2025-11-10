import { d3, topojson } from '../deps.js';
import { createSVG, dur, globalReveal } from '../core/utils.js';

export async function build(sel, props){
  await topojson;

  const W=1200, H=720;
  const svg = createSVG(sel, W, H);
  const defs = svg.append('defs');
  const g = svg.append('g'); // globally faded

  const projection = d3.geoAlbersUsa().fitSize([W,H], {type:'Sphere'});
  const path = d3.geoPath(projection);
  const topo = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r=>r.json());
  const states = window.topojson.feature(topo, topo.objects.states);

  g.append('path').datum({type:'Sphere'}).attr('d', path).attr('fill','rgba(255,255,255,.0)');
  g.selectAll('path.state').data(states.features).join('path')
    .attr('d', path)
    .attr('fill','rgba(255,255,255,.35)')
    .attr('stroke','rgba(255,255,255,.12)').attr('stroke-width',0.6);

  // Build sites in initial state (reduced radius, no stroke motion yet)
  const siteData = props.sites.map((s,i) => {
    const id=`rg${i}`;
    const grad=defs.append('radialGradient').attr('id',id);
    grad.append('stop').attr('offset','0%').attr('stop-color','rgba(255,255,255,.9)');
    grad.append('stop').attr('offset','100%').attr('stop-color','rgba(255,255,255,0)');

    const p = projection([s.lon, s.lat]);
    const rFinal = 40 + s.disp*60;
    const rInit = Math.max(10, rFinal * 0.55);

    const circle = g.append('circle')
      .attr('cx', p[0]).attr('cy', p[1])
      .attr('r', rInit)
      .attr('fill', `url(#${id})`)
      .attr('stroke', d3.interpolatePlasma(s.ej*.8))
      .attr('stroke-opacity', .5)
      .attr('stroke-dasharray', '6 8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dashoffset', 20);

    const label = g.append('text')
      .attr('x', p[0] + rInit/2 + 6)
      .attr('y', p[1] - rInit/2 - 6)
      .attr('fill','var(--ink)')
      .attr('font-size','var(--fs-geoLabel, 13px)')
      .attr('font-weight',600)
      .text(`${s.name} · EJ ${Math.round(s.ej*100)}pctl`);

    return { circle, label, rFinal };
  });

  globalReveal({
    container: sel,
    fadeSel: g,
    fadeMs: dur(700),
    ease: d3.easeCubicOut,
    animateFinal(){
      siteData.forEach(({circle,label,rFinal})=>{
        circle.transition().duration(dur(900)).ease(d3.easeCubicOut)
          .attr('r', rFinal)
          .on('end', function(){
            d3.select(this)
              .transition().duration(dur(1300))
              .attrTween('stroke-dashoffset', ()=> t => `${(1-t)*20}`);
          });
        const cx = +circle.attr('cx'), cy = +circle.attr('cy');
        label.transition().duration(dur(900)).ease(d3.easeCubicOut)
          .attr('x', cx + rFinal/2 + 6)
          .attr('y', cy - rFinal/2 - 6);
      });
    }
  });
}