// js/deck.js — unified slide schema: { label, text, figure, caption }

// Avoid using d3 utilities here to prevent 'd3 is not defined' at import-time
const randn = (mu=0, sigma=1) => {
  let u=0, v=0;
  while(u===0) u=Math.random();
  while(v===0) v=Math.random();
  const z = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
  return mu + sigma*z;
};

const years = Array.from({length:15}, (_,i)=>2018+i);
const demandMW=[800,950,1200,1500,2000,2800,3800,5200,6800,8200,9600,11000,12500,14000,15500];
const capacityMW=[3000,3200,3400,3600,3800,4000,4200,4400,4700,5000,5300,5600,5900,6200,6500];

// --- Simple formatters (no d3 at import time) ---
const d3formatYear = v => String(v);
const d3formatDefault = v => {
  if (v == null || isNaN(v)) return '';
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v/1e9).toFixed(1) + 'G';
  if (abs >= 1e6) return (v/1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (v/1e3).toFixed(1) + 'k';
  return String(Math.round(v));
};

import { warmMany } from '../core/geoWarm.js';

warmMany([
  // preload the topojsons you actually use
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
]);

const defaultBasemap = {
  url:'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
  object:'states',
  sphereFill:'rgba(255,255,255,.0)',
  stateFill:'rgba(255,255,255,.35)',
  stateStroke:'rgba(255,255,255,.12)',
  stateStrokeWidth:0.6
};

const deck = {
  themeVars: {
    '--bg': '#0f1115','--ink': '#e6e9ef','--muted': '#9aa4b2',
    '--brand':'#7bdff2','--brand-2':'#f7b267','--accent':'#f79d65','--danger':'#ef5d60','--ok':'#19d97b',
    '--panel':'rgba(17,18,23,.6)',

    // Responsive font-size tokens used by text.js
    '--fs-title-xs':'clamp(1.8rem,3vw,3rem)',
    '--fs-title-sm':'clamp(2.2rem,3.8vw,3.6rem)',
    '--fs-title-md':'clamp(2.8rem,6vw,6rem)',
    '--fs-title-lg':'clamp(3.4rem,7vw,7rem)',
    '--fs-subtitle-xs':'clamp(0.9rem,1.3vw,1.1rem)',
    '--fs-subtitle-sm':'clamp(1.0rem,1.6vw,1.25rem)',
    '--fs-subtitle-md':'clamp(1.15rem,1.9vw,1.4rem)',
    '--fs-subtitle-lg':'clamp(1.3rem,2.2vw,1.6rem)',
    '--fs-body-xs':'clamp(0.95rem,1.2vw,1.05rem)',
    '--fs-body-sm':'clamp(1.0rem,1.4vw,1.15rem)',
    '--fs-body-md':'clamp(1.08rem,1.6vw,1.25rem)',
    '--fs-body-lg':'clamp(1.2rem,1.9vw,1.35rem)'
  },

  // ==== Background groups ====
  mediaGroups: [
    { id:'group-1', media:{ type:'video', src:'media/vid-overview c.mp4', muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-2', media:{ type:'video', src:'media/vid-urban c.mp4',   muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-3', media:{ type:'video', src:'media/vid-impacts c.mp4',  muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-4', media:{ type:'video', src:'media/vid-future c.mp4',   muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } }
  ],

  // ==== Slides (UNIFIED schema) ====
  slides: [

    // GROUP 1 — OVERVIEW & CLUSTERS
    {
      id:'scene-cover', group:'group-1', nav:'Cover',
      text: {
        figSel:'#cover-box',
        props:{
          kicker:'CCGL9074 · Group 8',
          title:'Data Center Boom<br/>and<br/>Its **Urban Impact**',
          subtitle:'Where data center power demand clusters, how it strains grids — and what it means for prices, air, water, and neighborhoods.',
          align:'center', halign:'center',
          sizes:{ title:'lg', subtitle:'md', body:'sm' }
        }
      }
    },

    {
      id:'scene-intro-overview', group:'group-1', nav:'What’s happening',
      text: {
        figSel:'#intro-overview-box',
        props:{
          kicker:'Setting the stage',
          title:'**AI** & **cloud** are driving a ==step-change== in [rise]power demand[/rise]',
          subtitle:'Load is __clustering__ in a handful of metros with land, fiber, and substations — pushing [c:var(--brand-2)]local grids[/c] hard.',
          align:'center', halign:'center',
          sizes:{ title:'md', subtitle:'md', body:'md' }
        }
      }
    },

    // Map (unified geo: bubbles)
    {
      id:'scene-map', group:'group-1', nav:'Map',
      label:'US Clusters • radius ≈ IT load (MW) • Illustrative',
      text:{
        figSel:'#text-map',
        props:{
          kicker:'Where is demand clustering?',
          title:'Top U.S. data center hubs',
          subtitle:'Northern Virginia leads globally; Dallas, Phoenix, Silicon Valley, Atlanta, Columbus form the next tier.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'geo',
        figSel:'#map-canvas',
        props:{
          basemap: { ...defaultBasemap },
          layers:{
            bubbles: {
              data: [
                {name:'NoVA (DC Alley)',lon:-77.5,lat:39.05,mw:5000},{name:'Dallas–Fort Worth',lon:-97.0,lat:32.9,mw:2600},
                {name:'Silicon Valley',lon:-121.9,lat:37.4,mw:2100},{name:'Phoenix',lon:-112.07,lat:33.45,mw:1900},
                {name:'Columbus',lon:-82.98,lat:39.96,mw:1600},{name:'Atlanta',lon:-84.39,lat:33.75,mw:1600},
                {name:'Salt Lake City',lon:-111.9,lat:40.76,mw:900},{name:'Omaha',lon:-95.99,lat:41.25,mw:700}
              ],
              r:'mw',
              rRange:[6,58],
              style:{ fill:'rgba(123,223,242,.25)', stroke:'rgba(123,223,242,.9)', strokeWidth:1.6 },
              label:{ show:true, text:(d)=> d.name, fontSize:'var(--fs-geoLabel, 14px)' },
              tooltip:(d)=> `<strong>${d.name}</strong><br/>~${d.mw.toLocaleString()} MW`,
              anim:{ growMs:1400 }
            }
          },
          graphOpacity:1
        }
      },
      caption:'Vector basemap + responsive SVG for crispness at any zoom.'
    },

    {
      id:'scene-siting-text', group:'group-1', nav:'Siting context',
      text:{
        figSel:'#siting-text-box',
        props:{
          kicker:'Siting friction',
          title:'Close to [glow]substations & fiber[/glow]… but __not too close__ to neighborhoods',
          subtitle:'Permits, noise, water, and distribution capacity shape feasible parcels.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }
    },

    {
      id:'scene-scatter', group:'group-1', nav:'Siting',
      label:'Available Substation Capacity (MW) vs Distance (km)',
      text:{
        figSel:'#text-scatter',
        props:{
          kicker:'Siting frictions',
          title:'Capacity vs distance-to-substation',
          subtitle:'Near substations, capacity is easier to tap; farther sites add time, upgrades, cost.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'scatter',
        figSel:'#scatter-canvas',
        props:{
          points: Array.from({length:140}, ()=>{
            const dist=Math.random()*120; const base=210 - dist*1.1 + randn(0,22); return {dist, cap:Math.max(0,base)};
          }),
          xLabel:'Distance to Nearest Substation (km)', yLabel:'Available Capacity (MW)', graphOpacity:1
        }
      },
      caption:'Downward slope suggests distance costs time and megawatts.'
    },

    // GROUP 2 — GRID, QUEUES & FLOWS
    {
      id:'scene-intro-grid', group:'group-2', nav:'Wires vs. halls',
      text:{
        figSel:'#intro-grid-box',
        props:{
          kicker:'Speed to Power',
          title:'Data halls are **fast**; big wires are [c:#ef5d60]**slow**[/c]',
          subtitle:'Interconnection studies and transmission build times are the new critical path.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }
    },

    // Gap: unified line with band + a separate single-line+dot example
    {
      id:'scene-gap', group:'group-2', nav:'Gap',
      label:'Dominion/PJM territory (illustrative) • Demand vs Grid Capacity',
      text:{
        figSel:'#text-gap',
        props:{
          kicker:'The gap',
          title:'AI demand outpaces grid upgrades',
          subtitle:'IT load accelerates while bulk capacity grows linearly—creating the interconnection “gap.”',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'line',
        figSel:'#gap-canvas',
        props:{
          series: [
            { id:'Demand', data: years.map((y,i)=>({x:y, y:demandMW[i]})), styles:{ stroke:'var(--danger)', strokeWidth:3 }, marker:{ show:false } },
            { id:'Capacity', data: years.map((y,i)=>({x:y, y:capacityMW[i]})), styles:{ stroke:'var(--brand-2)', strokeWidth:3 }, marker:{ show:false } }
          ],
          bands: [
            { top:'Demand', bottom:'Capacity', fill:'rgba(239,93,96,0.18)', opacity:0.18 }
          ],
          axes: { xTicks:8, yTicks:6, grid:true, xFormat:d3formatYear, yFormat:d3formatDefault, xLabel:'Year', yLabel:'MW (utility territory)' },
          curve:'MonotoneX',
          graphOpacity:1
        }
      },
      caption:'Shaded shortfall swells as demand streaks ahead.'
    },

    {
      id:'scene-line-dot', group:'group-2', nav:'Line+Dot',
      label:'Utilization • Single Line with Marker',
      text:{
        figSel:'#text-line-dot',
        props:{
          kicker:'Example',
          title:'Single line with animated dot',
          subtitle:'Marker follows the stroke while the line draws in.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'line',
        figSel:'#line-dot-canvas',
        props:{
          series: [
            {
              id:'Utilization',
              data: years.map((y,i)=>({ x:y, y: 40 + 10*Math.sin(i/2) + (i*3) })), // illustrative
              styles:{ stroke:'var(--accent)', strokeWidth:3 },
              marker:{ show:true, r:6, fill:'var(--accent)' }
            }
          ],
          axes: { xTicks:8, yTicks:6, grid:true, xFormat:d3formatYear, yFormat:d3formatDefault, xLabel:'Year', yLabel:'% Utilization' },
          curve:'MonotoneX',
          graphOpacity:1
        }
      },
      caption:'Demonstrates dot/marker support in the unified line chart.'
    },

    {
      id:'scene-timeline', group:'group-2', nav:'Timeline',
      label:'Schedule • Data Center vs Transmission',
      text:{
        figSel:'#text-timeline',
        props:{
          kicker:'Speed to Power',
          title:'Timelines: fast halls, slow wires',
          subtitle:'Halls: ~12–24 months; high-voltage lines: 5–10 years.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'timeline',
        figSel:'#timeline-canvas',
        props:{ items:[ {name:'Data Center',min:12,max:24,color:'var(--ok)'}, {name:'Transmission',min:60,max:120,color:'var(--danger)'} ], xMax:130, graphOpacity:1 }
      },
      caption:'Buildings finish before big wires arrive.'
    },

    {
      id:'scene-intro-flows', group:'group-2', nav:'Bulk flows',
      text:{
        figSel:'#intro-flows-box',
        props:{
          kicker:'Who feeds the hubs?',
          title:'Power flows [rise]bend toward clusters[/rise]',
          subtitle:'Interregional transfers and congestion patterns re-route electrons to load pockets.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }
    },

    // Flow map (unified geo: flow layer)
    {
      id:'scene-flow2d', group:'group-2', nav:'Flows',
      label:'Flow Map • Arcs from generators → DC hubs • Thickness ≈ relative pull',
      text:{
        figSel:'#text-flow',
        props:{
          kicker:'Who feeds the hubs?',
          title:'Bulk power pull toward clusters',
          subtitle:'Curved ribbons show illustrative transfers; animated markers hint at congestion paths.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'geo',
        figSel:'#flow2d-canvas',
        props:{
          basemap: { ...defaultBasemap },
          layers:{
            flow:{
              hubs:[{name:'NoVA',lon:-77.5,lat:39.05},{name:'Dallas',lon:-97.0,lat:32.9},{name:'Phoenix',lon:-112.07,lat:33.45},{name:'Silicon Valley',lon:-121.9,lat:37.4},{name:'Atlanta',lon:-84.39,lat:33.75},{name:'Columbus',lon:-82.98,lat:39.96}],
              gens:[{name:'Palo Verde',lon:-112.86,lat:33.39},{name:'Four Corners',lon:-108.48,lat:36.67},{name:'Vogtle',lon:-82.19,lat:33.14},{name:'Prairie Island',lon:-92.63,lat:44.63},{name:'La Salle',lon:-89.09,lat:41.24}],
              edges:[['Palo Verde','Phoenix',0.9],['Four Corners','Phoenix',0.6],['La Salle','Columbus',0.55],['Prairie Island','NoVA',0.45],['Vogtle','Atlanta',0.8],['La Salle','Dallas',0.5],['Vogtle','NoVA',0.35],['Palo Verde','Silicon Valley',0.4]],
              curveBeta:0.8,
              dashSpeed:60,
              anim:{ nodeMs:600 }
            }
          },
          graphOpacity:1
        }
      },
      caption:'Great-circle-ish arcs; gradients and dashed motion for direction.'
    },

    {
      id:'scene-ridge', group:'group-2', nav:'Queues',
      label:'Ridgeline Ribbons • Queue GW by ISO (2018–2025)',
      text:{
        figSel:'#text-ridge',
        props:{
          kicker:'Structural delay',
          title:'Backlogs ridge higher by ISO',
          subtitle:'Joyplot ridgelines show queues thickening across PJM, MISO, SPP, ERCOT, CAISO, NYISO, ISO-NE.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'ridge',
        figSel:'#ridge-canvas',
        props:{ series:{
          'PJM': years.slice(0,8).map((y,i)=>({x:y,y:[80,95,120,180,260,380,520,650][i]})),
          'MISO': years.slice(0,8).map((y,i)=>({x:y,y:[60,70,95,140,210,300,420,520][i]})),
          'SPP':  years.slice(0,8).map((y,i)=>({x:y,y:[20,25,38,55,80,120,170,220][i]})),
          'ERCOT':years.slice(0,8).map((y,i)=>({x:y,y:[50,65,85,130,200,280,360,450][i]})),
          'CAISO':years.slice(0,8).map((y,i)=>({x:y,y:[35,45,60,85,120,160,210,260][i]})),
          'NYISO':years.slice(0,8).map((y,i)=>({x:y,y:[15,18,22,30,45,70,95,120][i]})),
          'ISO-NE':years.slice(0,8).map((y,i)=>({x:y,y:[12,15,18,24,34,48,65,82][i]}))
        }, graphOpacity:1 }
      },
      caption:'Each ridge = ISO; area = queued GW. Labels pinned.'
    },

    {
      id:'scene-sankey', group:'group-2', nav:'Stages',
      label:'Alluvial • Interconnection status transitions',
      text:{
        figSel:'#text-sankey',
        props:{
          kicker:'Where projects stall',
          title:'From request → studies → withdrawn/active',
          subtitle:'Sankey reveals attrition and bottlenecks across stages.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'sankey',
        figSel:'#sankey-canvas',
        props:{ nodes:[{name:'Requested'},{name:'Cluster Study'},{name:'Facilities Study'},{name:'Active'},{name:'Withdrawn'}],
          links:[ {source:'Requested',target:'Cluster Study',value:800},{source:'Cluster Study',target:'Facilities Study',value:450},{source:'Facilities Study',target:'Active',value:260},{source:'Cluster Study',target:'Withdrawn',value:200},{source:'Facilities Study',target:'Withdrawn',value:140},{source:'Requested',target:'Withdrawn',value:120} ],
          graphOpacity:1 }
      },
      caption:'Hover links to see MW moving between stages (illustrative).'
    },

    {
      id:'scene-chord', group:'group-2', nav:'Fuel→DC',
      label:'Chord • Generation mix → DC load share (illustrative)',
      text:{
        figSel:'#text-chord',
        props:{
          kicker:'What powers AI?',
          title:'Fuel paths into DC demand',
          subtitle:'Chord ribbons connect generation types to ISO DC share—what mix backs the boom.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'chord',
        figSel:'#chord-canvas',
        props:(()=>{ const fuels=['Gas','Coal','Nuclear','Wind','Solar']; const isos=['PJM','MISO','ERCOT','CAISO','NYISO']; const names=[...fuels, ...isos]; const N=names.length;
          const idx=n=> names.indexOf(n); const M=Array.from({length:N},()=>Array(N).fill(0)); function link(a,b,val){ M[idx(a)][idx(b)]=val; }
          link('Gas','PJM',28); link('Gas','MISO',20); link('Gas','ERCOT',26); link('Gas','CAISO',10); link('Gas','NYISO',12);
          link('Coal','PJM',8); link('Coal','MISO',12); link('Coal','ERCOT',6);
          link('Nuclear','PJM',14); link('Nuclear','MISO',10); link('Nuclear','NYISO',6);
          link('Wind','MISO',14); link('Wind','ERCOT',12); link('Wind','PJM',6); link('Wind','CAISO',4);
          link('Solar','CAISO',18); link('Solar','ERCOT',8); link('Solar','PJM',6);
          return { names, matrix:M, graphOpacity:1 }; })()
      },
      caption:'Hover a group to highlight its ribbons.'
    },

    // GROUP 3 — HOUSEHOLD & NEIGHBORHOOD IMPACTS
    {
      id:'scene-intro-impacts', group:'group-3', nav:'Impacts',
      text:{
        figSel:'#intro-impacts-box',
        props:{
          kicker:'Bills, burden, air & water',
          title:'Urban impacts concentrate where ==capacity is tight==',
          subtitle:'Rate pressure, peaker reliance, and water stress are not evenly shared.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }
    },

    // Prices table (now)
    {
      id:'scene-prices-now', group:'group-3', nav:'Prices (now)',
      label:'Average revenue per kWh by sector • Aug 2025 (EIA)',
      text:{
        figSel:'#text-prices-now',
        props:{
          kicker:'Rates & bills',
          title:'Latest retail electricity prices',
          subtitle:'Residential average revenue reached <strong>17.62¢/kWh</strong> in Aug 2025 (<span class="muted">+6.1% y/y</span>).',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'table',
        figSel:'#prices-now-wrap',
        props:{
          columns:[{key:'sector',title:'Sector'},{key:'price',title:'¢/kWh (Aug 2025)'},{key:'yoy',title:'YoY change'}],
          rows:[
            {sector:'Residential', price:'17.62', yoy:'+6.1%'},
            {sector:'Commercial',  price:'14.04', yoy:'+6.7%'},
            {sector:'Industrial',  price:'9.06',  yoy:'+4.5%'},
            {sector:'Transportation', price:'14.86', yoy:'+11.7%'},
          ],
          staggerMs: 160, graphOpacity:1
        }
      },
      caption:'Source: EIA Electricity Monthly Update (End Use, Aug 2025).'
    },

    // State highs/lows
    {
      id:'scene-prices-states', group:'group-3', nav:'States',
      label:'Residential avg revenue (¢/kWh) — highest & lowest • Aug 2025',
      text:{
        figSel:'#text-prices-states',
        props:{
          kicker:'Who pays most?',
          title:'State variation (residential)',
          subtitle:'Expensive coasts vs. cheap interior—rate structures and resource mix drive gaps.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'table',
        figSel:'#prices-states-wrap',
        props:{
          columns:[{key:'state',title:'State'},{key:'cents',title:'¢/kWh (Aug 2025)'},{key:'band',title:'Band'}],
          rows:[
            {state:'California',    cents:'29.31', band:'Highest'},
            {state:'Connecticut',   cents:'26.63', band:'Highest'},
            {state:'Massachusetts', cents:'25.89', band:'Highest'},
            {state:'North Dakota',  cents:'8.42',  band:'Lowest'},
            {state:'Louisiana',     cents:'9.61',  band:'Lowest'},
            {state:'Idaho',         cents:'9.86',  band:'Lowest'},
          ],
          staggerMs: 160, graphOpacity:1
        }
      },
      caption:'Source: EIA Electricity Monthly Update (End Use, Aug 2025).'
    },

    // Bills bubbles (unified geo: bubbles)
    {
      id:'scene-bubbles', group:'group-3', nav:'Bills',
      label:'Metro Map • Bubble radius ≈ annual $ increase / household',
      text:{
        figSel:'#text-bubbles',
        props:{
          kicker:'Wallet impact',
          title:'Where bills rise faster',
          subtitle:'Crisp bubbles over a US basemap with labels.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'geo',
        figSel:'#bubbles-canvas',
        props:{
          basemap: { ...defaultBasemap },
          layers:{
            bubbles:{
              data:[
                {name:'Phoenix',lon:-112.07,lat:33.45,inc:135},{name:'Dallas',lon:-97.0,lat:32.9,inc:110},
                {name:'NoVA',lon:-77.5,lat:39.05,inc:95},{name:'Atlanta',lon:-84.39,lat:33.75,inc:105},
                {name:'Columbus',lon:-82.98,lat:39.96,inc:85},{name:'Silicon Valley',lon:-121.9,lat:37.4,inc:120},
                {name:'SLC',lon:-111.9,lat:40.76,inc:80}
              ],
              r:'inc',
              rRange:[6,36],
              style:{ fill:'rgba(247,178,103,.25)', stroke:'rgba(247,157,101,1)', strokeWidth:1.6 },
              label:{ show:true, text:(m)=> `${m.name} · $${m.inc}/yr` },
              tooltip:(m)=> `<strong>${m.name}</strong><br/>$${m.inc}/yr`,
              anim:{ growMs:1600 }
            }
          },
          graphOpacity:1
        }
      },
      caption:'Hover to see metro and $/yr.'
    },

    // Hexgrid
    {
      id:'scene-hexgrid', group:'group-3', nav:'Afford',
      label:'Hex Grid • Burden = bill increase as % of median income',
      text:{
        figSel:'#text-hexgrid',
        props:{
          kicker:'Fairness',
          title:'Who feels hikes most?',
          subtitle:'Hex tiles color-coded by estimated % burden; labels show hotspots.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'geo',
        figSel:'#hexgrid-canvas',
        props:{
          basemap: { ...defaultBasemap, stateFill:'rgba(255,255,255,.04)', sphereFill:'rgba(255,255,255,.03)', stateStroke:'rgba(255,255,255,.10)' },
          layers:{
            hexgrid:{
              points:[
                {name:'Phoenix', lon:-112.07, lat:33.45, inc:135, income:73000},{name:'Dallas', lon:-97.0, lat:32.9, inc:110, income:75000},
                {name:'NoVA', lon:-77.5, lat:39.05, inc:95, income:130000},{name:'Atlanta', lon:-84.39, lat:33.75, inc:105, income:76000},
                {name:'Columbus', lon:-82.98, lat:39.96, inc:85, income:68000},{name:'Silicon Valley', lon:-121.9, lat:37.4, inc:120, income:140000},
                {name:'SLC', lon:-111.9, lat:40.76, inc:80, income:80000}
              ].map(m=> ({...m, burden: m.inc/Math.max(1,m.income)*100 })),
              valueKey:'burden',
              spacing:40, hexR:14, influence:80,
              colors:['#20334f','#f7dda6','#ef5d60'],
              labelFmt:(d)=> `${d.name} · ${d.burden.toFixed(2)}%`,
              anim:{ drawMs:800 }
            }
          },
          graphOpacity:1
        }
      },
      caption:'Hex tiling keeps visual density even; fully vector for sharpness.'
    },

    // Plumes
    {
      id:'scene-plumes', group:'group-3', nav:'Plumes',
      label:'Radial Fields • Peaker emissions & EJ proximity',
      text:{
        figSel:'#text-plumes',
        props:{
          kicker:'Air & equity',
          title:'Peaker reliance & nearby exposure',
          subtitle:'Radial fades approximate relative plume; rings mark neighborhoods; label shows EJ percentile.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'geo',
        figSel:'#plumes-canvas',
        props:{
          basemap: { ...defaultBasemap },
          layers:{
            plumes:{
              sites:[
                {name:'LA Basin Peaker',lon:-118.22,lat:34.05,ej:0.82,disp:0.9},{name:'Phoenix Peaker',lon:-112.09,lat:33.43,ej:0.68,disp:0.8},
                {name:'NYC Peaker',lon:-73.90,lat:40.73,ej:0.88,disp:0.85},{name:'Atlanta Peaker',lon:-84.40,lat:33.76,ej:0.74,disp:0.7}
              ],
              anim:{ growMs:900, dashMs:1300 }
            }
          },
          graphOpacity:1
        }
      },
      caption:'Soft gradients “breathe” via stroke-dash animation.'
    },

    // Heatmap
    {
      id:'scene-heatmap', group:'group-3', nav:'Peaker hrs',
      label:'Peaker Dispatch (hours) • Month × Hour-of-day (illustrative)',
      text:{
        figSel:'#text-heatmap',
        props:{
          kicker:'Reliability vs climate',
          title:'When peakers carry the load',
          subtitle:'Late summer afternoons stand out before wires arrive.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'heatmap',
        figSel:'#heatmap-canvas',
        props:{ getVal:(m,h)=>{ const seasonal=(m>=6 && m<=9)?1.0:0.4; const diurnal=(h>=15 && h<=20)?1.2:0.3; return Math.max(0, randn(seasonal*diurnal*4,1)); }, graphOpacity:1 }
      },
      caption:'Cells glow as dispatch hours increase.'
    },

    // Water choropleth
    {
      id:'scene-water', group:'group-3', nav:'Water',
      label:'Baseline Water Stress by State (illustrative)',
      text:{
        figSel:'#text-water',
        props:{
          kicker:'Cooling & scarcity',
          title:'Where water is tight',
          subtitle:'Scarcity concentrates in the Southwest & Intermountain West—pushing reclaimed/dry cooling.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'geo',
        figSel:'#water-canvas',
        props:{
          basemap:{
            ...defaultBasemap,
            choropleth:{
              valueByName: {'Arizona':.9,'Nevada':.9,'Utah':.75,'New Mexico':.75,'California':.75,'Colorado':.75,'Texas':.5,'Oklahoma':.5,'Idaho':.5,'Wyoming':.5,'Oregon':.5,'Washington':.5},
              color:{ range:['#eeabacff','#bf696aff','#944041ff','#580d0eff'], domain:[0,0.3,0.6,1] }
            }
          },
          graphOpacity:1
        }
      },
      caption:'States shaded from low (blue) to high (red).'
    },

    // GROUP 4 — SOLUTIONS, POLICY & WRAP
    {
      id:'scene-intro-solutions', group:'group-4', nav:'Solutions',
      text:{
        figSel:'#intro-solutions-box',
        props:{
          kicker:'Playbook',
          title:'[glow]Faster, fairer[/glow] “**Speed-to-Power**”',
          subtitle:'Fast-track queues, hybrid on-site options, and incentives tied to equity & water.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      }
    },

    {
      id:'scene-table1', group:'group-4', nav:'Incentives',
      label:'Illustrative Incentives',
      text:{
        figSel:'#tableA-text',
        props:{
          kicker:'Who wins?',
          title:'State & county incentives for data centers',
          subtitle:'Abatements/exemptions reduce up-front costs; locals trade near-term tax for jobs & base growth.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'table',
        figSel:'#tableA-cards',
        props:{ columns:[{key:'area',title:'State/County'},{key:'type',title:'Incentive Type'},{key:'value',title:'Headline Value'},{key:'notes',title:'Notes'}],
          rows:[ {area:'Virginia (Loudoun Co.)', type:'Sales & use tax exemption on DC equipment', value:'$300M+ lifetime (illus.)', notes:'Jobs + capex thresholds'},
                 {area:'Texas (Dallas Co.)', type:'Local abatements + Freeport', value:'$120M+ (project)', notes:'Layered local/state incentives'},
                 {area:'Arizona (Maricopa Co.)', type:'Transaction privilege/use tax', value:'$80M+', notes:'Reclaimed water partnerships'},
                 {area:'Ohio (Franklin Co.)', type:'TIF/CRA + infra offsets', value:'$90M+', notes:'Substation/road/water offsets'}],
          staggerMs: 180, graphOpacity:1 }
      },
      caption:'Rows slide in sequentially.'
    },

    {
      id:'scene-table2', group:'group-4', nav:'EJ',
      label:'Environmental Justice Signals',
      text:{
        figSel:'#tableB-text',
        props:{
          kicker:'Who pays?',
          title:'Air & income near energy assets',
          subtitle:'Indicators for tracts adjacent to peakers or bulk substations (illustrative slice).',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'table',
        figSel:'#tableB-cards',
        props:{ columns:[{key:'area',title:'Area'},{key:'pm',title:'PM2.5 (µg/m³)'},{key:'income',title:'Median Income'},{key:'near',title:'Near Plant?'}],
          rows:[ {area:'Tract A (near peaker)', pm:'10.8', income:'$48,200', near:'Yes'},
                 {area:'Tract B (substation-adjacent)', pm:'12.4', income:'$39,800', near:'Yes'},
                 {area:'Tract C (upwind)', pm:'8.7', income:'$62,100', near:'No'},
                 {area:'Tract D (downwind)', pm:'14.1', income:'$37,900', near:'Yes'}],
          staggerMs: 180, graphOpacity:1 }
      },
      caption:'Replace with census + AQ joins later.'
    },

    {
      id:'scene-hist', group:'group-4', nav:'Peaks',
      label:'Site Peak IT Load (MW) • Distribution',
      text:{
        figSel:'#text-hist',
        props:{
          kicker:'How big are sites?',
          title:'Peak demand distribution',
          subtitle:'Most new halls cluster 10–30 MW; hyperscale campuses string many halls—into hundreds of MW.',
          align:'center', halign:'center',
          sizes:{ title:'xs', subtitle:'xs', body:'xs' }
        }
      },
      figure:{
        type:'hist',
        figSel:'#hist-canvas',
        props:{ values:(()=>{ const base=[]; for(let i=0;i<220;i++) base.push(8+Math.abs(randn(8,5))); for(let i=0;i<80;i++) base.push(25+Math.abs(randn(0,6))); for(let i=0;i<30;i++) base.push(60+Math.abs(randn(0,15))); return base; })(), graphOpacity:1 }
      },
      caption:'Animated bars with ample bottom margin to avoid label overlap.'
    },

    {
      id:'scene-cards', group:'group-4', nav:'cards',
      text:{
        figSel:'#text-cards',
        props:{
          kicker:'The Verdict',
          title:'Toward a faster, fairer “Speed-to-Power”',
          subtitle:'Capture gains while hard-wiring power, water, and equity constraints into how, where, and when we build.',
          align:'center', halign:'center',
          sizes:{ title:'sm', subtitle:'sm', body:'sm' }
        }
      },
      figure:{ type:'cards', figSel:'#cards-figure', props:{ graphOpacity:1 } }
    },

    {
      id:'scene-credits', group:'group-4', nav:'Citations',
      label:'Selected Sources',
      figure:{
        type:'credits',
        figSel:'#credits-fig',
        props:{ items:[
          "DOE Grid Deployment Office (2025). “Speed to Power Initiative.”","PJM (2025). “Data Center Impacts on Load Forecast.”","Dominion Energy Virginia (2024). “Integrated Resource Plan (IRP).”",
          "CBRE (1H 2025). “North American Data Center Trends.”","IEA (2024). “Electricity 2024: Data centres, AI and electricity demand.”",
          "EIA (Oct 24, 2025). “Electricity Monthly Update – End Use (Aug 2025 data).”",
          "EPA (2024). “eGRID: Emissions & Generation Resource Integrated Database.”","EPA (2023). “EJScreen.”","WRI (2023). “Aqueduct Water Risk Atlas.”",
          "USGS (2024). “Estimated Use of Water in the United States.”","FERC (2025). “Order No. 2023 Interconnection Reforms: Implementation Updates.”","NERC (2024). “Long-Term Reliability Assessment (LTRA).”",
          "Berkeley Lab (2024). “Queued Up: Interconnection Queue Data.”","Uptime Institute (2025). “Global Data Center Survey.”","U.S. Census Bureau (2024). “ACS 1-year Estimates (Income & Housing).”",
          "BLS (2025). “CPI Detailed Report – Energy Price Components.”","CAISO (2025). “Transmission Plan.”","ERCOT (2024). “Long-Term System Assessment (LTSA).”","NYISO (2025). “Power Trends.”","CPUC (2024). “Integrated Resource Plan – Preferred System Plan.”"
        ], graphOpacity:1 }
      }
    }

  ]
};

export default deck;