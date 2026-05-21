"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Terminal, DollarSign, CloudLightning, 
  History, Sparkles, X, ChevronRight, Layout, RefreshCw, LogIn 
} from 'lucide-react';
import RequirementsForm from '../components/RequirementsForm';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import CostEstimator from '../components/CostEstimator';
import TerraformViewer from '../components/TerraformViewer';
import DeploymentEngine from '../components/DeploymentEngine';
import WizardProgress from '../components/WizardProgress';

const STEPS = ["Requirements", "Architecture Diagram", "Cost Estimator", "Terraform Viewer", "Deploy Console"];

export default function Home() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cloudProvider, setCloudProvider] = useState("AWS");
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history list on component mount
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error("Failed to load design history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async ({ requirements, cloudProvider, scale }) => {
    setIsLoading(true);
    setCloudProvider(cloudProvider);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, cloudProvider, scale }),
      });

      if (!response.ok) throw new Error('Failed to generate architecture');

      const data = await response.json();
      setResult(data);
      setStep(1); // Advance to architecture
      fetchHistory(); // Refresh history panel
    } catch (error) {
      console.error(error);
      alert('An error occurred while generating the architecture.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDesign = async (designId) => {
    setIsLoading(true);
    setIsHistoryOpen(false);
    try {
      const response = await fetch(`/api/history?id=${designId}`);
      if (!response.ok) throw new Error('Failed to load past design');
      const data = await response.json();
      setResult(data);
      setCloudProvider(data.cloudProvider);
      setStep(1); // Advance directly to architecture view
    } catch (error) {
      console.error(error);
      alert('Failed to load historical design.');
    } finally {
      setIsLoading(false);
    }
  };

  const goNext = () => setStep(s => Math.min(s + 1, 4));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const spring = { type: "spring", stiffness: 380, damping: 38 };

  // Determine dynamic container sizing based on step
  // Forms are kept compact, while diagrams and calculators get cinematic widescreen layouts
  const containerMaxWidth = step === 0 ? 'max-w-[700px]' : 'max-w-[1240px]';

  return (
    <main className="relative min-h-screen px-6 py-12 md:py-20 z-10 overflow-hidden select-none transition-all duration-700">
      
      {/* Cinematic Aurora Glowing Blobs in Background */}
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[130px] -z-20 aurora-glow-1 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-[150px] -z-20 aurora-glow-2 pointer-events-none" />

      {/* Floating Control Bar in Header */}
      <header className="max-w-[1240px] mx-auto flex justify-between items-center mb-12 relative">
        <div className="flex items-center gap-2.5">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 shadow-neon"
          >
            <CloudLightning size={20} className="text-purple-400" />
          </motion.div>
          <span className="text-sm font-extrabold tracking-widest text-white/90 uppercase">
            AETHER.CLOUD
          </span>
        </div>

        {/* History Toggle Button */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold glass-button"
        >
          <History size={14} className="text-purple-400" />
          <span>Restores ({historyList.length})</span>
        </button>
      </header>

      {/* Main Core Container */}
      <div className={`mx-auto ${containerMaxWidth} transition-all duration-700 relative`}>
        
        {/* Title Block */}
        <motion.div 
          initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gradient pb-1.5">
            Cloud Design Generator
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-lg mx-auto font-light tracking-wide">
            Automate natural language prompts into structural multi-region cloud designs, regional cost projections, and Terraform templates instantly.
          </p>
        </motion.div>

        {/* Dynamic Wizard Steps Bar */}
        <div className="mb-10 max-w-[800px] mx-auto">
          <WizardProgress steps={STEPS} currentStep={step} />
        </div>

        {/* Core Wizard Sliding Canvas Panels */}
        <div className="relative perspective-[2000px]">
          <AnimatePresence mode="wait">
            
            {/* Loader overlay */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-3xl z-50 flex flex-col items-center justify-center gap-4 border border-white/5"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
                <span className="text-sm font-semibold tracking-wider text-purple-400 animate-pulse">Running Cloud AI Engines...</span>
              </motion.div>
            )}

            {/* Step 0: Requirements Form */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 30, rotateY: 8 }}
                transition={spring}
              >
                <RequirementsForm onSubmit={handleGenerate} isLoading={isLoading} />
              </motion.div>
            )}

            {/* Step 1: Architecture Canvas */}
            {step === 1 && result && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 30, rotateY: 8 }}
                transition={spring}
              >
                <section className="glass-panel rounded-[28px] p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] to-transparent rounded-[28px] pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2.5">
                        <Network size={20} className="text-purple-400" />
                        Infrastructure Architecture Blueprint
                      </h2>
                      <p className="text-xs text-zinc-400 font-light mt-1">Pattern Model: <strong className="text-white font-medium">{result.pattern}</strong></p>
                    </div>
                    <div className="bg-purple-500/10 text-purple-400 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider border border-purple-500/25 uppercase">
                      Active Schema design
                    </div>
                  </div>
                  
                  {/* Full Widescreen Diagram Canvas Wrapper */}
                  <div className="h-[520px] rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40 shadow-inner relative">
                    <ArchitectureDiagram data={result.architecture} />
                  </div>
                  
                  {/* AI Architectural Decisions Description Card */}
                  <div className="mt-6 p-5 bg-white/[0.01] rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-2 text-zinc-300 uppercase tracking-wider">
                      <span className="text-purple-400">✦</span> Architectural Decisions & Analysis
                    </h3>
                    <p className="text-xs leading-relaxed text-zinc-400 font-light">
                      {result.analysis}
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {/* Step 2: Live Cost Estimator */}
            {step === 2 && result && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 30, rotateY: 8 }}
                transition={spring}
              >
                <section className="glass-panel rounded-[28px] p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent rounded-[28px] pointer-events-none" />
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-2.5">
                      <DollarSign size={20} className="text-emerald-400" />
                      Regional Billing Lab
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-1">Interactively adjust resource variables and region coefficients to compare cost vectors.</p>
                  </div>

                  <CostEstimator costs={result.costs} />
                </section>
              </motion.div>
            )}

            {/* Step 3: Terraform Configuration Viewer */}
            {step === 3 && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 30, rotateY: 8 }}
                transition={spring}
              >
                <section className="glass-panel rounded-[28px] p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-transparent rounded-[28px] pointer-events-none" />
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2.5">
                      <Terminal size={20} className="text-blue-400" />
                      Infrastructure-As-Code (Terraform)
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-1">Declarative configuration stack file automatically compiled to provision this environment.</p>
                  </div>

                  <div className="bg-zinc-950/60 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                    <TerraformViewer code={result.terraformCode} />
                  </div>
                </section>
              </motion.div>
            )}

            {/* Step 4: Provisioning Deploy Console */}
            {step === 4 && result && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -30, rotateY: -8 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 30, rotateY: 8 }}
                transition={spring}
              >
                <section className="glass-panel rounded-[28px] p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.04] to-transparent rounded-[28px] pointer-events-none" />
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2.5">
                      <ChevronRight size={20} className="text-rose-400" />
                      Orchestration Pipeline Console
                    </h2>
                    <p className="text-xs text-zinc-400 font-light mt-1">Deploy this architecture diagram using simulated automated pipelines to your active workspace.</p>
                  </div>

                  {/* Pass the dynamic generated designId */}
                  <DeploymentEngine 
                    cloud={cloudProvider} 
                    pattern={result.pattern} 
                    designId={result.designId || result.id} 
                  />
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation controls underneath cards */}
          {step > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-4 mt-6 max-w-[500px] mx-auto"
            >
              <button 
                onClick={goBack} 
                className="flex-1 py-3.5 rounded-2xl text-xs font-semibold glass-button"
              >
                Back
              </button>
              {step < 4 ? (
                <button 
                  onClick={goNext} 
                  className="flex-[2] py-3.5 rounded-2xl text-xs font-bold bg-white text-black hover:bg-white/90 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-white/5"
                >
                  Continue to {STEPS[step + 1].split(" ")[0]}
                </button>
              ) : (
                <button 
                  onClick={() => { setStep(0); setResult(null); }} 
                  className="flex-[2] py-3.5 rounded-2xl text-xs font-bold glass-button"
                >
                  Reset & Design New Stack
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Design History Slide-Out Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Dark background modal overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide-out cabinet panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[360px] bg-zinc-950 border-r border-white/5 z-50 p-6 flex flex-col gap-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-purple-400" />
                  <h3 className="text-sm font-extrabold tracking-widest text-zinc-300 uppercase">Design Repository</h3>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Saved designs list scroll */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 custom-scrollbar pr-1">
                {historyList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 font-light">
                    <History size={32} className="opacity-15 mb-3" />
                    <p className="text-xs">No saved blueprints found in your database.</p>
                  </div>
                ) : (
                  historyList.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleRestoreDesign(item.id)}
                      className="p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer group flex flex-col gap-2 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-0.5 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                          {item.cloudProvider} ({item.scale})
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                          ${item.costs?.monthly?.toLocaleString() || '---'}/mo
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                        {item.pattern}
                      </h4>

                      <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-light">
                        {item.prompt}
                      </p>

                      <div className="flex justify-between items-center text-[8px] text-zinc-600 font-semibold pt-1 border-t border-white/[0.02]">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>Region: {item.region}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setIsHistoryOpen(false);
                    setStep(0);
                    setResult(null);
                  }}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} className="text-purple-400" />
                  <span>Start Fresh Blueprint</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
