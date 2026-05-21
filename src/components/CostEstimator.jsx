"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Sparkles, Shield, RefreshCw, Zap, TrendingUp, Info } from 'lucide-react';

const REGIONS = [
  { id: 'us-east', name: 'US East (N. Virginia)', coef: 1.0 },
  { id: 'us-west', name: 'US West (Oregon)', coef: 1.05 },
  { id: 'eu-west', name: 'Europe (Frankfurt)', coef: 1.18 },
  { id: 'ap-singapore', name: 'Asia Pacific (Singapore)', coef: 1.25 },
  { id: 'in-mumbai', name: 'India (Mumbai)', coef: 0.88 }
];

const DB_TYPES = [
  { id: 'postgres', name: 'RDS PostgreSQL', awsBase: 45, azureBase: 40 },
  { id: 'mongodb', name: 'MongoDB Atlas / NoSQL', awsBase: 65, azureBase: 60 }
];

export default function CostEstimator({ costs: initialCosts }) {
  // Baselines from initial requirements
  const [activeCloud, setActiveCloud] = useState('AWS');
  const [selectedRegion, setSelectedRegion] = useState('us-east');
  const [trafficScale, setTrafficScale] = useState(250000); // Daily visitors
  const [computeNodes, setComputeNodes] = useState(4);
  const [dbStorage, setDbStorage] = useState(250); // GBs
  const [selectedDb, setSelectedDb] = useState('postgres');
  const [multiAz, setMultiAz] = useState(true);
  const [cdnSecurity, setCdnSecurity] = useState(true);

  // Initialize state based on generated data if available
  useEffect(() => {
    if (initialCosts) {
      // Estimate approximate sliders from baselines
      const estNodes = Math.max(2, Math.min(20, Math.round(initialCosts.compute / 70)));
      setComputeNodes(estNodes);
      const estStorage = Math.max(50, Math.min(2000, Math.round(initialCosts.storage / 0.15)));
      setDbStorage(estStorage);
    }
  }, [initialCosts]);

  // Compute live calculations
  const liveBilling = useMemo(() => {
    const region = REGIONS.find(r => r.id === selectedRegion) || REGIONS[0];
    const dbType = DB_TYPES.find(d => d.id === selectedDb) || DB_TYPES[0];

    // Regional and Cloud factors
    const regionCoef = region.coef;
    
    // AWS baseline calculations
    const awsCompute = computeNodes * 68 * regionCoef; // $68/mo per node base
    const awsDb = (dbType.awsBase + (dbStorage * 0.14)) * (multiAz ? 1.8 : 1.0) * regionCoef;
    const awsNetwork = (trafficScale / 100000) * 12 * regionCoef;
    const awsManaged = (cdnSecurity ? 75 : 20) + (trafficScale > 1000000 ? 150 : 35);
    const awsTotal = awsCompute + awsDb + awsNetwork + awsManaged;

    // Azure baseline calculations (approx 8% cheaper compute, slightly different storage/network models)
    const azureCompute = computeNodes * 62 * regionCoef;
    const azureDb = (dbType.azureBase + (dbStorage * 0.12)) * (multiAz ? 1.75 : 1.0) * regionCoef;
    const azureNetwork = (trafficScale / 100000) * 10 * regionCoef;
    const azureManaged = (cdnSecurity ? 65 : 18) + (trafficScale > 1000000 ? 135 : 30);
    const azureTotal = azureCompute + azureDb + azureNetwork + azureManaged;

    const currentTotal = activeCloud === 'AWS' ? awsTotal : azureTotal;
    const alternateTotal = activeCloud === 'AWS' ? azureTotal : awsTotal;

    const breakdown = activeCloud === 'AWS' 
      ? { compute: awsCompute, db: awsDb, network: awsNetwork, managed: awsManaged }
      : { compute: azureCompute, db: azureDb, network: azureNetwork, managed: azureManaged };

    return {
      monthly: Math.round(currentTotal),
      alternateMonthly: Math.round(alternateTotal),
      breakdown: {
        compute: Math.round(breakdown.compute),
        storage: Math.round(breakdown.db),
        network: Math.round(breakdown.network),
        managed: Math.round(breakdown.managed)
      },
      savingsPct: Math.round(((alternateTotal - currentTotal) / alternateTotal) * 100)
    };
  }, [activeCloud, selectedRegion, trafficScale, computeNodes, dbStorage, selectedDb, multiAz, cdnSecurity]);

  // Format visitors for slider display
  const formatTraffic = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${val / 1000}k`;
    return val;
  };

  const currentRegion = REGIONS.find(r => r.id === selectedRegion);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
      {/* Interactive Sliders Panel (Left 7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 mb-6 uppercase flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            Infrastructure Variables
          </h3>

          {/* Cloud Toggle & Region Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-2">Target Provider</label>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                {['AWS', 'Azure'].map((cloud) => {
                  const isActive = activeCloud === cloud;
                  return (
                    <button
                      key={cloud}
                      type="button"
                      onClick={() => setActiveCloud(cloud)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                        isActive 
                          ? cloud === 'AWS'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-lg shadow-amber-500/5'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-lg shadow-blue-500/5'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {cloud}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-2">Cloud Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-purple-500/50 transition-colors"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-zinc-950 text-white">
                    {r.name} (x{r.coef.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sliders Container */}
          <div className="flex flex-col gap-6">
            {/* Traffic Scale */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-zinc-400">Daily Traffic (Visitors)</span>
                <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {formatTraffic(trafficScale)} / day
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={trafficScale}
                onChange={(e) => setTrafficScale(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono">
                <span>10k</span>
                <span>1M</span>
                <span>2.5M</span>
                <span>5M</span>
              </div>
            </div>

            {/* Compute Nodes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-zinc-400">Compute Clusters (EC2 / VM Nodes)</span>
                <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {computeNodes} Nodes
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="32"
                step="1"
                value={computeNodes}
                onChange={(e) => setComputeNodes(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono">
                <span>1 Node (Dev)</span>
                <span>8 Nodes</span>
                <span>16 Nodes</span>
                <span>32 Nodes (Scale)</span>
              </div>
            </div>

            {/* Database Selection & Storage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Database Type</label>
                <select
                  value={selectedDb}
                  onChange={(e) => setSelectedDb(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-purple-500/50"
                >
                  {DB_TYPES.map(db => (
                    <option key={db.id} value={db.id} className="bg-zinc-950">
                      {db.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-zinc-400">DB Storage Capacity</span>
                  <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {dbStorage} GB
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="2000"
                  step="20"
                  value={dbStorage}
                  onChange={(e) => setDbStorage(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[9px] text-zinc-600 mt-1 font-mono">
                  <span>20 GB</span>
                  <span>500 GB</span>
                  <span>1 TB</span>
                  <span>2 TB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Switches */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setMultiAz(!multiAz)}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
              multiAz 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield size={14} className={multiAz ? 'text-purple-400' : 'text-zinc-500'} />
                Multi-AZ HA Replication
              </span>
              <span className="text-[10px] text-zinc-400 font-light">Dual standby databases for seamless failover</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${multiAz ? 'bg-purple-500' : 'bg-zinc-800'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 transform ${multiAz ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          <div 
            onClick={() => setCdnSecurity(!cdnSecurity)}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
              cdnSecurity 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-black/20 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap size={14} className={cdnSecurity ? 'text-purple-400' : 'text-zinc-500'} />
                CDN & Enterprise WAF
              </span>
              <span className="text-[10px] text-zinc-400 font-light">Global caching plus robust security firewall protection</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${cdnSecurity ? 'bg-purple-500' : 'bg-zinc-800'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 transform ${cdnSecurity ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Cost Dial & Breakdown (Right 5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
          {/* Subtle Ambient Background Ring */}
          <div className="absolute w-72 h-72 rounded-full border border-white/[0.02] -z-10 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />
          
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-emerald-500" />
            Active Estimation Run
          </span>

          <AnimatePresence mode="wait">
            <motion.div 
              key={liveBilling.monthly}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-1"
            >
              <span className="text-5xl font-extrabold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-400">
                ${liveBilling.monthly.toLocaleString()}
              </span>
            </motion.div>
          </AnimatePresence>

          <span className="text-xs text-zinc-400 font-light mb-6">estimated monthly billing USD</span>

          {/* Service breakdown bars */}
          <div className="w-full text-left flex flex-col gap-3.5 mb-6">
            {[
              { label: 'Compute Instances', val: liveBilling.breakdown.compute, color: '#bf5af2' },
              { label: 'Managed DB & Storage', val: liveBilling.breakdown.storage, color: '#30d158' },
              { label: 'Data & Networking', val: liveBilling.breakdown.network, color: '#0a84ff' },
              { label: 'CDN & Operations', val: liveBilling.breakdown.managed, color: '#ff453a' }
            ].map((item, idx) => {
              const pct = Math.max(5, Math.round((item.val / liveBilling.monthly) * 100));
              return (
                <div key={idx}>
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                    <span>{item.label}</span>
                    <span className="font-mono text-zinc-300">${item.val.toLocaleString()}/mo ({pct}%)</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.02]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cloud Comparison Card */}
          <div className="w-full p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-3">
            <div className="flex justify-between text-xs font-semibold text-zinc-400">
              <span>Cloud Price Match</span>
              <span className="text-[10px] text-zinc-500 font-normal">AWS vs Azure</span>
            </div>

            <div className="flex gap-4 items-center">
              {/* Current provider cost bar */}
              <div className="flex-1 text-left">
                <span className="text-[9px] uppercase tracking-wide text-zinc-500 block mb-0.5">{activeCloud}</span>
                <span className="text-sm font-extrabold font-mono">${liveBilling.monthly}/mo</span>
                <div className="h-1.5 rounded-full mt-1.5 w-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${activeCloud === 'AWS' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: '100%' }} />
                </div>
              </div>

              {/* Swap indicator */}
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5 border border-white/10 hover:rotate-180 transition-transform duration-500 cursor-pointer" onClick={() => setActiveCloud(activeCloud === 'AWS' ? 'Azure' : 'AWS')}>
                <RefreshCw size={12} className="text-purple-400 animate-pulse" />
              </div>

              {/* Alternate provider cost bar */}
              <div className="flex-1 text-left">
                <span className="text-[9px] uppercase tracking-wide text-zinc-500 block mb-0.5">{activeCloud === 'AWS' ? 'Azure' : 'AWS'}</span>
                <span className="text-sm font-extrabold font-mono text-zinc-400">${liveBilling.alternateMonthly}/mo</span>
                <div className="h-1.5 rounded-full mt-1.5 w-full bg-white/5 overflow-hidden">
                  {/* Calculate proportional height based on cost difference */}
                  <div 
                    className={`h-full rounded-full ${activeCloud === 'AWS' ? 'bg-blue-500/50' : 'bg-amber-500/50'}`} 
                    style={{ width: `${Math.round((liveBilling.alternateMonthly / liveBilling.monthly) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Savings Tip Banner */}
            {liveBilling.alternateMonthly < liveBilling.monthly ? (
              <div className="text-[10px] py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium tracking-wide flex items-center justify-center gap-1.5 mt-1">
                <span>💡 Switching to {activeCloud === 'AWS' ? 'Azure' : 'AWS'} could save you {Math.round(((liveBilling.monthly - liveBilling.alternateMonthly) / liveBilling.monthly) * 100)}% on baseline services.</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Cloud Billing Insights Recommendations */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md flex flex-col gap-4 text-left">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Info size={14} className="text-purple-400" />
            AWS/Azure Financial Advisory
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-zinc-400 font-light">
            <li className="flex gap-2">
              <span className="text-purple-400">✦</span>
              <span><strong>Reserved Instances:</strong> Committing compute nodes for a 1-year term reduces compute expenditures by <strong>35%</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">✦</span>
              <span><strong>Auto-Scaling Triggers:</strong> Configuring compute scales down during off-peak hours (e.g. 10 PM - 6 AM) saving <strong>20%</strong> compute power.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-400">✦</span>
              <span><strong>India Edge Optimization:</strong> Deploying in <strong>{currentRegion.name}</strong> reduces costs by <strong>{Math.round((1 - currentRegion.coef) * 100)}%</strong> compared to standard US baselines.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
