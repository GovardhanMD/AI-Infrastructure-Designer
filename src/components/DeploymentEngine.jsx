"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, ShieldCheck, Terminal, Play, History, CheckCircle, AlertTriangle } from 'lucide-react';

const CLOUD_CONFIGS = {
  AWS: { color: "#FF9900", icon: "☁️", term: "EC2 Clusters" },
  Azure: { color: "#0078D4", icon: "⛅", term: "VM Scale Sets" },
};

export default function DeploymentEngine({ cloud, pattern, designId }) {
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [env, setEnv] = useState("prod");
  const [pastDeployments, setPastDeployments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const logEndRef = useRef(null);
  
  const cfg = CLOUD_CONFIGS[cloud] || CLOUD_CONFIGS["AWS"];

  // Scroll to bottom of terminal logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Load past deployments for this design
  const loadDeploymentHistory = async () => {
    if (!designId) return;
    try {
      const res = await fetch(`/api/history?id=${designId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.deployments) {
          setPastDeployments(data.deployments);
        }
      }
    } catch (err) {
      console.error("Failed to load deployment history", err);
    }
  };

  useEffect(() => {
    loadDeploymentHistory();
  }, [designId, status]);

  const deploy = async () => {
    setStatus("running");
    setLogs([]);

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cloudProvider: cloud, 
          env, 
          pattern,
          designId 
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(Boolean);
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            setLogs(prev => [...prev, data.log]);
            if (data.isDone) {
              setStatus("done");
              loadDeploymentHistory(); // Refresh history timeline
            }
          }
        }
      }
    } catch (error) {
      setLogs(prev => [...prev, `[Error] Deployment failed: ${error.message}`]);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white text-left">
      {/* Selection Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "prod", label: "Production Cluster", replicas: "3 Availability Zones", spec: "High Availability Active" },
          { id: "stage", label: "Staging Sandbox", replicas: "2 Availability Zones", spec: "Simulated Scale" },
          { id: "dev", label: "Development Workspace", replicas: "1 Availability Zone", spec: "Ephemeral Compute" }
        ].map((e) => {
          const isActive = env === e.id;
          return (
            <div 
              key={e.id} 
              onClick={() => status === "idle" && setEnv(e.id)}
              className={`p-4 rounded-2xl transition-all duration-300 border ${
                isActive 
                  ? 'bg-purple-500/10 border-purple-500/30' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              } ${status === "idle" ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold ${isActive ? 'text-purple-400' : 'text-zinc-300'}`}>
                  {e.label}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-500">
                  {e.replicas}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-light leading-tight">{e.spec}</p>
            </div>
          );
        })}
      </div>

      {/* Deploy Button */}
      <div className="flex gap-4">
        <button
          onClick={deploy}
          disabled={status === "running"}
          style={{ backgroundColor: status === "done" ? '#30d158' : cfg.color }}
          className="flex-1 py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-purple-500/5 disabled:opacity-50"
        >
          {status === "idle" && (
            <>
              <Play size={16} fill="currentColor" />
              Deploy to {cloud} {env.toUpperCase()}
            </>
          )}
          {status === "running" && (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Provisioning Virtual Stack...
            </>
          )}
          {status === "done" && (
            <>
              <CheckCircle size={16} />
              Stack Provisioned Successfully
            </>
          )}
          {status === "error" && (
            <>
              <AlertTriangle size={16} />
              Deployment Failed
            </>
          )}
        </button>

        {pastDeployments.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 rounded-2xl bg-white/[0.04] border border-white/5 text-zinc-300 hover:bg-white/[0.08] transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <History size={16} />
            <span>Runs ({pastDeployments.length})</span>
          </button>
        )}
      </div>

      {/* Terminal logs panel */}
      {logs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-black/80 border border-white/10 rounded-2xl p-5 shadow-inner"
        >
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/5 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-2">
              <Terminal size={14} className="text-purple-400" />
              Terraform Console Output
            </span>
            <span className="text-[10px] bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded text-purple-400 font-bold animate-pulse">
              STREAMING LOGS
            </span>
          </div>
          
          <div className="max-h-[220px] overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1.5 custom-scrollbar">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={
                  log.includes("✅") 
                    ? "text-emerald-400" 
                    : log.includes("Error") 
                      ? "text-rose-400" 
                      : log.includes("[") 
                        ? "text-zinc-500" 
                        : "text-zinc-300"
                }
              >
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </motion.div>
      )}

      {/* Deployment History Timeline */}
      {showHistory && pastDeployments.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4"
        >
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <History size={14} className="text-purple-400" />
            Provisioning History Log
          </h4>

          <div className="flex flex-col gap-3 font-light text-xs max-h-[200px] overflow-y-auto">
            {pastDeployments.map((deploy, idx) => (
              <div key={deploy.id} className="p-3 bg-black/30 rounded-xl border border-white/[0.03] flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200 capitalize">Env: {deploy.environment}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      deploy.status === 'success' 
                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' 
                        : 'bg-rose-500/10 border border-rose-500/25 text-rose-400'
                    }`}>
                      {deploy.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Deployed: {new Date(deploy.createdAt).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setLogs(deploy.logs);
                    setStatus(deploy.status === 'success' ? 'done' : 'error');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-300 font-medium tracking-wide transition-colors"
                >
                  Load Output
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
