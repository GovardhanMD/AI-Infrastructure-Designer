"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function TerraformViewer({ code }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "12px 16px", background: "var(--bg-primary)", borderBottom: "1px solid var(--glass-border)" 
      }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>main.tf</span>
        <button 
          onClick={handleCopy} 
          style={{ 
            background: "none", border: "none", cursor: "pointer", 
            fontSize: 12, color: copied ? "var(--accent-green)" : "var(--text-secondary)", 
            padding: "4px 8px", borderRadius: 6, transition: "color 0.2s",
            display: "flex", alignItems: "center", gap: 6
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ 
        margin: 0, padding: "20px", fontSize: 12, lineHeight: 1.7, 
        fontFamily: "monospace", overflowX: "auto", color: "var(--text-primary)", 
        maxHeight: 400, overflowY: "auto" 
      }}>
        {code.split("\\n").map((line, i) => {
          let color = "inherit";
          if (line.trim().startsWith("#")) color = "var(--text-tertiary)";
          else if (line.includes("resource") || line.includes("module") || line.includes("variable") || line.includes("output")) color = "var(--accent-purple)";
          else if (line.includes("=")) {
            const [k] = line.split("=");
            if (k.trim() && !k.includes("{")) color = "var(--text-primary)";
          }
          return <span key={i} style={{ color, display: "block" }}>{line}</span>;
        })}
      </pre>
    </div>
  );
}
