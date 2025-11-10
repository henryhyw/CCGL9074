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

const deck = {
  themeVars: {
    '--bg': '#0f1115','--ink': '#e6e9ef','--muted': '#9aa4b2',
    '--brand':'#7bdff2','--brand-2':'#f7b267','--accent':'#f79d65','--danger':'#ef5d60','--ok':'#19d97b',
    '--panel':'rgba(17,18,23,.6)',

    // --- Responsive font-size tokens used by text.js ---
    // Title
    '--fs-title-xs':'clamp(1.8rem,3vw,3rem)',
    '--fs-title-sm':'clamp(2.2rem,3.8vw,3.6rem)',
    '--fs-title-md':'clamp(2.8rem,6vw,6rem)',
    '--fs-title-lg':'clamp(3.4rem,7vw,7rem)',
    // Subtitle
    '--fs-subtitle-xs':'clamp(0.9rem,1.3vw,1.1rem)',
    '--fs-subtitle-sm':'clamp(1.0rem,1.6vw,1.25rem)',
    '--fs-subtitle-md':'clamp(1.15rem,1.9vw,1.4rem)',
    '--fs-subtitle-lg':'clamp(1.3rem,2.2vw,1.6rem)',
    // Body
    '--fs-body-xs':'clamp(0.95rem,1.2vw,1.05rem)',
    '--fs-body-sm':'clamp(1.0rem,1.4vw,1.15rem)',
    '--fs-body-md':'clamp(1.08rem,1.6vw,1.25rem)',
    '--fs-body-lg':'clamp(1.2rem,1.9vw,1.35rem)'
  },

  // ==== Four background groups (each with its own video) ====
  mediaGroups: [
    { id:'group-1', media:{ type:'video', src:'media/vid-overview c.mp4', muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-2', media:{ type:'video', src:'media/vid-urban c.mp4',   muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-3', media:{ type:'video', src:'media/vid-impacts c.mp4',  muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } },
    { id:'group-4', media:{ type:'video', src:'media/vid-future c.mp4',   muted:true, loop:true, autoplay:true, opacity:1 }, overlay:{ opacity:.50 } }
  ],

  // ==== Slides (grouped, with added text interstitials & animated text effects) ====
  slides: [

    // GROUP 1 — OVERVIEW & CLUSTERS
    { id:'scene-cover', type:'text', overlayGrid:false, group:'group-1', nav:'Cover', figSel:'#cover-box',
      props:{
        kicker:'BSDS3001 · Group C',
        // Large cover sizing + effects
        title:'Data Center Boom<br/>and<br/>Its **Social Impact**',
        subtitle:'Where data center power demand clusters, how it strains grids — and what it means for prices, air, water, and neighborhoods.',
        align:'center', halign:'center',
        sizes:{ title:'lg', subtitle:'md', body:'sm' }
      }
    },

    { id:'scene-intro-overview', type:'text', group:'group-1', nav:'What’s happening', figSel:'#intro-overview-box',
      props:{
        kicker:'Setting the stage',
        // Medium for the second page + effects
        title:'**AI** & **cloud** are driving a ==step-change== in [rise]power demand[/rise]',
        subtitle:'Load is __clustering__ in a handful of metros with land, fiber, and substations — pushing [c:var(--brand-2)]local grids[/c] hard.',
        align:'center', halign:'center',
        sizes:{ title:'md', subtitle:'md', body:'md' }
      }
    },

    { id:'scene-map', type:'map', group:'group-1', nav:'Map',
      graphLabel:'US Clusters • radius ≈ IT load (MW) • Illustrative',
      textPanel:{ id:'text-map', html:`<div class="kicker">Where is demand clustering?</div><h2>Top U.S. data center hubs</h2><p class="muted">Northern Virginia leads globally; Dallas, Phoenix, Silicon Valley, Atlanta, Columbus form the next tier.</p>`},
      figSel:'#map-canvas', caption:'Vector basemap + responsive SVG for crispness at any zoom.',
      props:{ clusters:[
        {name:'NoVA (DC Alley)',lon:-77.5,lat:39.05,mw:5000},{name:'Dallas–Fort Worth',lon:-97.0,lat:32.9,mw:2600},
        {name:'Silicon Valley',lon:-121.9,lat:37.4,mw:2100},{name:'Phoenix',lon:-112.07,lat:33.45,mw:1900},
        {name:'Columbus',lon:-82.98,lat:39.96,mw:1600},{name:'Atlanta',lon:-84.39,lat:33.75,mw:1600},
        {name:'Salt Lake City',lon:-111.9,lat:40.76,mw:900},{name:'Omaha',lon:-95.99,lat:41.25,mw:700}
      ], graphOpacity:1 }
    },

    { id:'scene-siting-text', type:'text', group:'group-1', nav:'Siting context', figSel:'#siting-text-box',
      props:{
        kicker:'Siting friction',
        // Small from here on + effects
        title:'Close to [glow]substations & fiber[/glow]… but __not too close__ to neighborhoods',
        subtitle:'Permits, noise, water, and distribution capacity shape feasible parcels.',
        align:'left', halign:'center',
        sizes:{ title:'sm', subtitle:'sm', body:'sm' }
      }
    },

    { id:'scene-scatter', type:'scatter', group:'group-1', nav:'Siting',
      graphLabel:'Available Substation Capacity (MW) vs Distance (km)',
      textPanel:{ id:'text-scatter', html:`<div class="kicker">Siting frictions</div><h2>Capacity vs distance-to-substation</h2><p>Near substations, capacity is easier to tap; farther sites add time, upgrades, cost.</p>` },
      figSel:'#scatter-canvas', caption:'Downward slope suggests distance costs time and megawatts.',
      props:{ points: Array.from({length:140}, ()=>{
        const dist=Math.random()*120; const base=210 - dist*1.1 + randn(0,22); return {dist, cap:Math.max(0,base)};
      }), xLabel:'Distance to Nearest Substation (km)', yLabel:'Available Capacity (MW)', graphOpacity:1 }
    },

    // GROUP 2 — GRID, QUEUES & FLOWS
    { id:'scene-intro-grid', type:'text', group:'group-2', nav:'Wires vs. halls', figSel:'#intro-grid-box',
      props:{
        kicker:'Speed to Power',
        title:'Data halls are **fast**; big wires are [c:#ef5d60]**slow**[/c]',
        subtitle:'Interconnection studies and transmission build times are the new critical path.',
        align:'left', halign:'center',
        sizes:{ title:'sm', subtitle:'sm', body:'sm' }
      }
    },

    { id:'scene-gap', type:'gap', group:'group-2', nav:'Gap',
      graphLabel:'Dominion/PJM territory (illustrative) • Demand vs Grid Capacity',
      textPanel:{ id:'text-gap', html:`<div class="kicker">The gap</div><h2>AI demand outpaces grid upgrades</h2><p>IT load accelerates while bulk capacity grows linearly—creating the interconnection “gap.”</p>`},
      figSel:'#gap-canvas', caption:'Shaded shortfall swells as demand streaks ahead.',
      props:{ seriesA: years.map((y,i)=>({x:y, y:demandMW[i]})), seriesB: years.map((y,i)=>({x:y, y:capacityMW[i]})), xLabel:'Year', yLabel:'MW (utility territory)', graphOpacity:1 }
    },

    { id:'scene-timeline', type:'timeline', group:'group-2', nav:'Timeline',
      graphLabel:'Schedule • Data Center vs Transmission',
      textPanel:{ id:'text-timeline', html:`<div class="kicker">Speed to Power</div><h2>Timelines: fast halls, slow wires</h2><p>Halls: ~12–24 months; high-voltage lines: 5–10 years.</p>`},
      figSel:'#timeline-canvas', caption:'Buildings finish before big wires arrive.',
      props:{ items:[ {name:'Data Center',min:12,max:24,color:'var(--ok)'}, {name:'Transmission',min:60,max:120,color:'var(--danger)'} ], xMax:130, graphOpacity:1 }
    },

    { id:'scene-intro-flows', type:'text', group:'group-2', nav:'Bulk flows', figSel:'#intro-flows-box',
      props:{
        kicker:'Who feeds the hubs?',
        title:'Power flows [rise]bend toward clusters[/rise]',
        subtitle:'Interregional transfers and congestion patterns re-route electrons to load pockets.',
        align:'left', halign:'center',
        sizes:{ title:'sm', subtitle:'sm', body:'sm' }
      },
    },

    { id:'scene-flow2d', type:'flow2d', group:'group-2', nav:'Flows',
      graphLabel:'Flow Map • Arcs from generators → DC hubs • Thickness ≈ relative pull',
      textPanel:{ id:'text-flow', html:`<div class="kicker">Who feeds the hubs?</div><h2>Bulk power pull toward clusters</h2><p>Curved ribbons show illustrative transfers; animated markers hint at congestion paths.</p>`},
      figSel:'#flow2d-canvas', caption:'Great-circle-ish arcs; gradients and dashed motion for direction.',
      props:{ hubs:[{name:'NoVA',lon:-77.5,lat:39.05},{name:'Dallas',lon:-97.0,lat:32.9},{name:'Phoenix',lon:-112.07,lat:33.45},{name:'Silicon Valley',lon:-121.9,lat:37.4},{name:'Atlanta',lon:-84.39,lat:33.75},{name:'Columbus',lon:-82.98,lat:39.96}],
        gens:[{name:'Palo Verde',lon:-112.86,lat:33.39},{name:'Four Corners',lon:-108.48,lat:36.67},{name:'Vogtle',lon:-82.19,lat:33.14},{name:'Prairie Island',lon:-92.63,lat:44.63},{name:'La Salle',lon:-89.09,lat:41.24}],
        edges:[['Palo Verde','Phoenix',0.9],['Four Corners','Phoenix',0.6],['La Salle','Columbus',0.55],['Prairie Island','NoVA',0.45],['Vogtle','Atlanta',0.8],['La Salle','Dallas',0.5],['Vogtle','NoVA',0.35],['Palo Verde','Silicon Valley',0.4]],
        graphOpacity:1 }
    },

    { id:'scene-ridge', type:'ridge', group:'group-2', nav:'Queues',
      graphLabel:'Ridgeline Ribbons • Queue GW by ISO (2018–2025)',
      textPanel:{ id:'text-ridge', html:`<div class="kicker">Structural delay</div><h2>Backlogs ridge higher by ISO</h2><p>Joyplot ridgelines show queues thickening across PJM, MISO, SPP, ERCOT, CAISO, NYISO, ISO-NE.</p>`},
      figSel:'#ridge-canvas', caption:'Each ridge = ISO; area = queued GW. Labels pinned.',
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

    { id:'scene-sankey', type:'sankey', group:'group-2', nav:'Stages',
      graphLabel:'Alluvial • Interconnection status transitions',
      textPanel:{ id:'text-sankey', html:`<div class="kicker">Where projects stall</div><h2>From request → studies → withdrawn/active</h2><p>Sankey reveals attrition and bottlenecks across stages.</p>`},
      figSel:'#sankey-canvas', caption:'Hover links to see MW moving between stages (illustrative).',
      props:{ nodes:[{name:'Requested'},{name:'Cluster Study'},{name:'Facilities Study'},{name:'Active'},{name:'Withdrawn'}],
        links:[ {source:'Requested',target:'Cluster Study',value:800},{source:'Cluster Study',target:'Facilities Study',value:450},{source:'Facilities Study',target:'Active',value:260},{source:'Cluster Study',target:'Withdrawn',value:200},{source:'Facilities Study',target:'Withdrawn',value:140},{source:'Requested',target:'Withdrawn',value:120} ],
        graphOpacity:1 }
    },

    { id:'scene-chord', type:'chord', group:'group-2', nav:'Fuel→DC',
      graphLabel:'Chord • Generation mix → DC load share (illustrative)',
      textPanel:{ id:'text-chord', html:`<div class="kicker">What powers AI?</div><h2>Fuel paths into DC demand</h2><p>Chord ribbons connect generation types to ISO DC share—what mix backs the boom.</p>`},
      figSel:'#chord-canvas', caption:'Hover a group to highlight its ribbons.',
      props:(()=>{ const fuels=['Gas','Coal','Nuclear','Wind','Solar']; const isos=['PJM','MISO','ERCOT','CAISO','NYISO']; const names=[...fuels, ...isos]; const N=names.length;
        const idx=n=> names.indexOf(n); const M=Array.from({length:N},()=>Array(N).fill(0)); function link(a,b,val){ M[idx(a)][idx(b)]=val; }
        link('Gas','PJM',28); link('Gas','MISO',20); link('Gas','ERCOT',26); link('Gas','CAISO',10); link('Gas','NYISO',12);
        link('Coal','PJM',8); link('Coal','MISO',12); link('Coal','ERCOT',6);
        link('Nuclear','PJM',14); link('Nuclear','MISO',10); link('Nuclear','NYISO',6);
        link('Wind','MISO',14); link('Wind','ERCOT',12); link('Wind','PJM',6); link('Wind','CAISO',4);
        link('Solar','CAISO',18); link('Solar','ERCOT',8); link('Solar','PJM',6);
        return { names, matrix:M, graphOpacity:1 }; })()
    },

    // GROUP 3 — HOUSEHOLD & NEIGHBORHOOD IMPACTS
    { id:'scene-intro-impacts', type:'text', group:'group-3', nav:'Impacts', figSel:'#intro-impacts-box',
      props:{
        kicker:'Bills, burden, air & water',
        title:'Urban impacts concentrate where ==capacity is tight==',
        subtitle:'Rate pressure, peaker reliance, and water stress are not evenly shared.',
        align:'left', halign:'center',
        sizes:{ title:'sm', subtitle:'sm', body:'sm' }
      }
    },

    { id:'scene-prices', type:'prices', group:'group-3', nav:'Prices',
      graphLabel:'U.S. Residential Price (¢/kWh) • 2010–2024',
      textPanel:{ id:'text-prices', html:`<div class="kicker">Rates & bills</div><h2>Residential electricity prices</h2><p>Flat-ish 2010s; sharper uptick after 2021 as fuels and grid investment rise.</p>`},
      figSel:'#prices-canvas', caption:'Tracer animates along the line.',
      props:{ points: Array.from({length:15}, (_,i)=> ({x:2010+i, y:[11.6,11.7,11.9,12.1,12.6,12.7,12.6,12.9,12.9,13.0,13.2,13.7,15.0,15.9,16.4][i]})), graphOpacity:1 }
    },

    { id:'scene-bubbles', type:'bubbles', group:'group-3', nav:'Bills',
      graphLabel:'Metro Map • Bubble radius ≈ annual $ increase / household',
      textPanel:{ id:'text-bubbles', html:`<div class="kicker">Wallet impact</div><h2>Where bills rise faster</h2><p>Crisp bubbles over a US basemap with labels.</p>`},
      figSel:'#bubbles-canvas', caption:'Hover to see metro and $/yr.',
      props:{ metros:[
          {name:'Phoenix',lon:-112.07,lat:33.45,inc:135},{name:'Dallas',lon:-97.0,lat:32.9,inc:110},
          {name:'NoVA',lon:-77.5,lat:39.05,inc:95},{name:'Atlanta',lon:-84.39,lat:33.75,inc:105},
          {name:'Columbus',lon:-82.98,lat:39.96,inc:85},{name:'Silicon Valley',lon:-121.9,lat:37.4,inc:120},
          {name:'SLC',lon:-111.9,lat:40.76,inc:80}
        ], valueKey:'inc', labelFmt:(m)=> `${m.name} · $${m.inc}/yr`, graphOpacity:1 }
    },

    { id:'scene-hexgrid', type:'hexgrid', group:'group-3', nav:'Afford',
      graphLabel:'Hex Grid • Burden = bill increase as % of median income',
      textPanel:{ id:'text-hexgrid', html:`<div class="kicker">Fairness</div><h2>Who feels hikes most?</h2><p>Hex tiles color-coded by estimated % burden; labels show hotspots.</p>`},
      figSel:'#hexgrid-canvas', caption:'Hex tiling keeps visual density even; fully vector for sharpness.',
      props:{ points:[
          {name:'Phoenix', lon:-112.07, lat:33.45, inc:135, income:73000},{name:'Dallas', lon:-97.0, lat:32.9, inc:110, income:75000},
          {name:'NoVA', lon:-77.5, lat:39.05, inc:95, income:130000},{name:'Atlanta', lon:-84.39, lat:33.75, inc:105, income:76000},
          {name:'Columbus', lon:-82.98, lat:39.96, inc:85, income:68000},{name:'Silicon Valley', lon:-121.9, lat:37.4, inc:120, income:140000},
          {name:'SLC', lon:-111.9, lat:40.76, inc:80, income:80000}
        ].map(m=> ({...m, burden: m.inc/Math.max(1,m.income)*100 })), graphOpacity:1 }
    },

    { id:'scene-plumes', type:'plumes', group:'group-3', nav:'Plumes',
      graphLabel:'Radial Fields • Peaker emissions & EJ proximity',
      textPanel:{ id:'text-plumes', html:`<div class="kicker">Air & equity</div><h2>Peaker reliance & nearby exposure</h2><p>Radial fades approximate relative plume; rings mark neighborhoods; label shows EJ percentile.</p>`},
      figSel:'#plumes-canvas', caption:'Soft gradients “breathe” via stroke-dash animation.',
      props:{ sites:[
          {name:'LA Basin Peaker',lon:-118.22,lat:34.05,ej:0.82,disp:0.9},{name:'Phoenix Peaker',lon:-112.09,lat:33.43,ej:0.68,disp:0.8},
          {name:'NYC Peaker',lon:-73.90,lat:40.73,ej:0.88,disp:0.85},{name:'Atlanta Peaker',lon:-84.40,lat:33.76,ej:0.74,disp:0.7}
        ], graphOpacity:1 }
    },

    { id:'scene-heatmap', type:'heatmap', group:'group-3', nav:'Peaker hrs',
      graphLabel:'Peaker Dispatch (hours) • Month × Hour-of-day (illustrative)',
      textPanel:{ id:'text-heatmap', html:`<div class="kicker">Reliability vs climate</div><h2>When peakers carry the load</h2><p>Late summer afternoons stand out before wires arrive.</p>`},
      figSel:'#heatmap-canvas', caption:'Cells glow as dispatch hours increase.',
      props:{ getVal:(m,h)=>{ const seasonal=(m>=6 && m<=9)?1.0:0.4; const diurnal=(h>=15 && h<=20)?1.2:0.3; return Math.max(0, randn(seasonal*diurnal*4,1)); }, graphOpacity:1 }
    },

    { id:'scene-water', type:'water', group:'group-3', nav:'Water',
      graphLabel:'Baseline Water Stress by State (illustrative)',
      textPanel:{ id:'text-water', html:`<div class="kicker">Cooling & scarcity</div><h2>Where water is tight</h2><p>Scarcity concentrates in the Southwest & Intermountain West—pushing reclaimed/dry cooling.</p>`},
      figSel:'#water-canvas', caption:'States shaded from low (blue) to high (red).',
      props:{ stressByState: {'Arizona':.9,'Nevada':.9,'Utah':.75,'New Mexico':.75,'California':.75,'Colorado':.75,'Texas':.5,'Oklahoma':.5,'Idaho':.5,'Wyoming':.5,'Oregon':.5,'Washington':.5}, graphOpacity:1 }
    },

    // GROUP 4 — SOLUTIONS, POLICY & WRAP
    { id:'scene-intro-solutions', type:'text', group:'group-4', nav:'Solutions', figSel:'#intro-solutions-box',
      props:{
        kicker:'Playbook',
        title:'[glow]Faster, fairer[/glow] “**Speed-to-Power**”',
        subtitle:'Fast-track queues, hybrid on-site options, and incentives tied to equity & water.',
        align:'left', halign:'center',
        sizes:{ title:'sm', subtitle:'sm', body:'sm' }
      }
    },

    { id:'scene-table1', type:'table', group:'group-4', nav:'Incentives',
      graphLabel:'Illustrative Incentives',
      textPanel:{ id:'tableA-text', html:`<div class="kicker">Who wins?</div><h3>State & county incentives for data centers</h3><p>Abatements/exemptions reduce up-front costs; locals trade near-term tax for jobs & base growth.</p>`},
      figSel:'#tableA-wrap', caption:'Rows slide in sequentially.',
      props:{ columns:[{key:'area',title:'State/County'},{key:'type',title:'Incentive Type'},{key:'value',title:'Headline Value'},{key:'notes',title:'Notes'}],
        rows:[ {area:'Virginia (Loudoun Co.)', type:'Sales & use tax exemption on DC equipment', value:'$300M+ lifetime (illus.)', notes:'Jobs + capex thresholds'},
               {area:'Texas (Dallas Co.)', type:'Local abatements + Freeport', value:'$120M+ (project)', notes:'Layered local/state incentives'},
               {area:'Arizona (Maricopa Co.)', type:'Transaction privilege/use tax', value:'$80M+', notes:'Reclaimed water partnerships'},
               {area:'Ohio (Franklin Co.)', type:'TIF/CRA + infra offsets', value:'$90M+', notes:'Substation/road/water offsets'}],
        staggerMs: 180, graphOpacity:1 }
    },

    { id:'scene-table2', type:'table', group:'group-4', nav:'EJ',
      graphLabel:'Environmental Justice Signals',
      textPanel:{ id:'tableB-text', html:`<div class="kicker">Who pays?</div><h3>Air & income near energy assets</h3><p>Indicators for tracts adjacent to peakers or bulk substations (illustrative slice).</p>`},
      figSel:'#tableB-wrap', caption:'Replace with census + AQ joins later.',
      props:{ columns:[{key:'area',title:'Area'},{key:'pm',title:'PM2.5 (µg/m³)'},{key:'income',title:'Median Income'},{key:'near',title:'Near Plant?'}],
        rows:[ {area:'Tract A (near peaker)', pm:'10.8', income:'$48,200', near:'Yes'},
               {area:'Tract B (substation-adjacent)', pm:'12.4', income:'$39,800', near:'Yes'},
               {area:'Tract C (upwind)', pm:'8.7', income:'$62,100', near:'No'},
               {area:'Tract D (downwind)', pm:'14.1', income:'$37,900', near:'Yes'}],
        staggerMs: 180, graphOpacity:1 }
    },

    { id:'scene-hist', type:'hist', group:'group-4', nav:'Peaks',
      graphLabel:'Site Peak IT Load (MW) • Distribution',
      textPanel:{ id:'text-hist', html:`<div class="kicker">How big are sites?</div><h2>Peak demand distribution</h2><p>Most new halls cluster 10–30 MW; hyperscale campuses string many halls—into hundreds of MW.</p>`},
      figSel:'#hist-canvas', caption:'Animated bars with ample bottom margin to avoid label overlap.',
      props:{ values:(()=>{ const base=[]; for(let i=0;i<220;i++) base.push(8+Math.abs(randn(8,5))); for(let i=0;i<80;i++) base.push(25+Math.abs(randn(0,6))); for(let i=0;i<30;i++) base.push(60+Math.abs(randn(0,15))); return base; })(), graphOpacity:1 }
    },

    { id:'scene-wrap', type:'wrap', group:'group-4', nav:'Wrap',
      graphLabel:'Closing',
      textPanel:{ id:'text-wrap', html:`<div class="kicker">The Verdict</div><h2>Toward a faster, fairer “Speed-to-Power”</h2><p class="muted">Capture gains while hard-wiring power, water, and equity constraints into how, where, and when we build.</p>`},
      figSel:'#wrap-figure', caption:'Balance gains with constraints—grid, water, justice.',
      props:{ graphOpacity:1 }
    },

    { id:'scene-credits', type:'credits', group:'group-4', nav:'Citations',
      graphLabel:'Selected Sources', figSel:'#credits-fig', caption:'',
      props:{ items:[
          "DOE Grid Deployment Office (2025). “Speed to Power Initiative.”","PJM (2025). “Data Center Impacts on Load Forecast.”","Dominion Energy Virginia (2024). “Integrated Resource Plan (IRP).”",
          "CBRE (1H 2025). “North American Data Center Trends.”","IEA (2024). “Electricity 2024: Data centres, AI and electricity demand.”","EIA (2025). “Electric Power Monthly.”",
          "EPA (2024). “eGRID: Emissions & Generation Resource Integrated Database.”","EPA (2023). “EJScreen.”","WRI (2023). “Aqueduct Water Risk Atlas.”",
          "USGS (2024). “Estimated Use of Water in the United States.”","FERC (2025). “Order No. 2023 Interconnection Reforms: Implementation Updates.”","NERC (2024). “Long-Term Reliability Assessment (LTRA).”",
          "Berkeley Lab (2024). “Queued Up: Interconnection Queue Data.”","Uptime Institute (2025). “Global Data Center Survey.”","U.S. Census Bureau (2024). “ACS 1-year Estimates (Income & Housing).”",
          "BLS (2025). “CPI Detailed Report – Energy Price Components.”","CAISO (2025). “Transmission Plan.”","ERCOT (2024). “Long-Term System Assessment (LTSA).”","NYISO (2025). “Power Trends.”","CPUC (2024). “Integrated Resource Plan – Preferred System Plan.”"
        ], graphOpacity:1 }
    }

  ]
};

export default deck;
