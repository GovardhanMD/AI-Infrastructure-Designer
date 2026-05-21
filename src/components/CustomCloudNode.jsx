"use client";

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';

const CATEGORY_ICONS = {
  users: Icons.Users,
  dns: Icons.Globe,
  lb: Icons.Shuffle,
  compute: Icons.Server,
  container: Icons.Boxes,
  database: Icons.Database,
  cdn: Icons.Zap,
  cache: Icons.Layers,
  monitoring: Icons.Activity,
  security: Icons.Shield,
  storage: Icons.HardDrive,
  pipeline: Icons.Workflow,
};

const DEFAULT_ICON = Icons.Cloud;

export default memo(function CustomCloudNode({ data }) {
  const { 
    label, 
    category = 'compute', 
    subtitle, 
    cloud = 'AWS', 
    details = [], 
    status = 'active' 
  } = data;

  const IconComponent = CATEGORY_ICONS[category.toLowerCase()] || DEFAULT_ICON;

  // Cloud provider styles
  const isAWS = cloud.toUpperCase() === 'AWS';
  const accentColor = isAWS ? '#FF9900' : '#0078D4';
  const glowShadow = isAWS 
    ? '0 0 15px rgba(255, 153, 0, 0.25)' 
    : '0 0 15px rgba(0, 120, 212, 0.25)';
  const borderStyle = isAWS 
    ? 'border-amber-500/20 hover:border-amber-500/50' 
    : 'border-blue-500/20 hover:border-blue-500/50';

  return (
    <div 
      className={`relative px-5 py-4 rounded-2xl bg-black/85 border ${borderStyle} backdrop-blur-xl shadow-2xl transition-all duration-300 min-w-[220px] group`}
      style={{
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.5), ${glowShadow}`,
      }}
    >
      {/* Top connection port */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-white/30 !w-2.5 !h-2.5 !border-none hover:!bg-purple-500 transition-colors" 
      />

      <div className="flex items-center gap-3.5">
        {/* Sleek icon wrapper */}
        <div 
          className="p-2.5 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: `${accentColor}10`,
            borderColor: `${accentColor}30`,
          }}
        >
          <IconComponent 
            size={20} 
            style={{ color: accentColor }}
          />
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col min-w-0 flex-1">
          <span 
            className="text-[9px] uppercase tracking-wider font-bold mb-0.5 opacity-60"
            style={{ color: accentColor }}
          >
            {category}
          </span>
          <h4 className="text-sm font-semibold text-white tracking-wide truncate">
            {label}
          </h4>
          {subtitle && (
            <span className="text-[10px] text-zinc-400 font-light truncate mt-0.5">
              {subtitle}
            </span>
          )}
        </div>

        {/* Mini Status Dot */}
        <span className="relative flex h-2 w-2">
          {status === 'scaling' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            status === 'scaling' ? 'bg-purple-500' : 'bg-emerald-500'
          }`}></span>
        </span>
      </div>

      {/* Extra details array (badges) */}
      {details && details.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex gap-1.5 flex-wrap">
          {details.map((detail, index) => (
            <span 
              key={index} 
              className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.03] font-medium tracking-wide"
            >
              {detail}
            </span>
          ))}
        </div>
      )}

      {/* Bottom connection port */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-white/30 !w-2.5 !h-2.5 !border-none hover:!bg-purple-500 transition-colors" 
      />
    </div>
  );
});
