"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import styles from './Components.module.css';

const CLOUD_CONFIGS = {
  AWS: { color: "#FF9900", icon: "☁️" },
  Azure: { color: "#0078D4", icon: "⛅" },
};

const SCALES = ["small", "medium", "large", "enterprise"];

export default function RequirementsForm({ onSubmit, isLoading }) {
  const [requirements, setRequirements] = useState('');
  const [cloudProvider, setCloudProvider] = useState('AWS');
  const [scale, setScale] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requirements.trim() || isLoading) return;
    onSubmit({ requirements, cloudProvider, scale });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={styles.formContainer}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--glass-border)",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4, color: "var(--text-primary)" }}>Describe your infrastructure needs</h2>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Be specific about your workload, expected traffic, and business requirements</div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <textarea 
            className={styles.textarea}
            placeholder="e.g. I need a scalable web application for an e-commerce platform expecting 50,000 daily users..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%", minHeight: 120, borderRadius: 10, padding: "12px 14px",
              border: "1px solid var(--glass-border)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)", fontSize: 14, lineHeight: 1.6,
              resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
              outline: "none", transition: "border-color 0.2s",
            }}
          />
        </div>

        {/* Cloud Selection */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--text-secondary)" }}>Cloud Provider</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["AWS", "Azure"].map(c => (
              <div 
                key={c} 
                onClick={() => !isLoading && setCloudProvider(c)} 
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10, cursor: isLoading ? "default" : "pointer",
                  border: cloudProvider === c ? `1.5px solid ${CLOUD_CONFIGS[c].color}` : "1px solid var(--glass-border)",
                  background: cloudProvider === c ? CLOUD_CONFIGS[c].color + "10" : "var(--bg-tertiary)",
                  color: cloudProvider === c ? CLOUD_CONFIGS[c].color : "var(--text-secondary)",
                  fontSize: 13, fontWeight: cloudProvider === c ? 600 : 400, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <span>{CLOUD_CONFIGS[c].icon}</span> {c}
              </div>
            ))}
          </div>
        </div>

        {/* Scale Selection */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "var(--text-secondary)" }}>Scale</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {SCALES.map(s => (
              <div 
                key={s} 
                onClick={() => !isLoading && setScale(s)} 
                style={{
                  padding: "8px 4px", borderRadius: 8, cursor: isLoading ? "default" : "pointer", fontSize: 11, fontWeight: 500,
                  border: scale === s ? "1.5px solid var(--accent-purple)" : "1px solid var(--glass-border)",
                  background: scale === s ? "var(--accent-purple)" : "var(--bg-tertiary)",
                  color: scale === s ? "#fff" : "var(--text-secondary)",
                  transition: "all 0.2s", textTransform: "capitalize", textAlign: "center"
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !requirements.trim()}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: requirements.trim() ? "var(--text-primary)" : "var(--bg-tertiary)",
            color: requirements.trim() ? "var(--bg-primary)" : "var(--text-tertiary)",
            border: "none", cursor: requirements.trim() ? "pointer" : "default",
            transition: "all 0.25s cubic-bezier(.16,1,.3,1)",
            transform: isLoading ? "scale(0.98)" : "scale(1)",
            display: "flex", justifyContent: "center", alignItems: "center", gap: 8
          }}
        >
          {isLoading ? (
            '⏳ Analyzing requirements...'
          ) : (
            <>
              <Sparkles size={18} />
              Generate Architecture
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
