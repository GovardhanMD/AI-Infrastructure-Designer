import React from 'react';
import { motion } from 'framer-motion';

export default function WizardProgress({ steps, currentStep }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, padding: "0 4px", position: "relative" }}>
      <div style={{ position: "absolute", top: 14, left: "5%", right: "5%", height: 1, background: "var(--glass-border)", zIndex: 0 }} />
      {steps.map((label, index) => {
        const active = currentStep === index;
        const done = currentStep > index;
        
        return (
          <div key={label} style={{ zIndex: 1, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <motion.div 
              initial={false}
              animate={{
                background: done ? "var(--accent-green)" : active ? "var(--accent-purple)" : "var(--bg-tertiary)",
                color: done || active ? "#fff" : "var(--text-secondary)",
                borderColor: active || done ? "transparent" : "var(--glass-border)",
                boxShadow: active ? "0 0 0 4px rgba(139, 92, 246, 0.2)" : "none",
              }}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600,
                border: "1px solid var(--glass-border)",
              }}
            >
              {done ? "✓" : index + 1}
            </motion.div>
            <span style={{ 
              fontSize: 11, 
              color: active ? "var(--text-primary)" : "var(--text-tertiary)", 
              fontWeight: active ? 600 : 400, 
              transition: "all 0.3s" 
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
