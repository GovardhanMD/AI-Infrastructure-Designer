"use client";

import React from 'react';
import { getBezierPath } from '@xyflow/react';

export default function GlowingEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  // Dynamically determine connection color (purple default, or custom colors like AWS orange / Azure blue)
  const strokeColor = style.stroke || '#bf5af2';

  return (
    <>
      <style>{`
        @keyframes glowing-edge-pulse {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      
      {/* Thicker transparent interactive background path */}
      <path
        id={id}
        style={{ ...style, strokeWidth: 8, stroke: 'transparent', fill: 'none' }}
        className="react-flow__edge-path-bg cursor-pointer"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Base connection line with low opacity */}
      <path
        style={{
          ...style,
          stroke: strokeColor,
          strokeOpacity: 0.15,
          strokeWidth: 2,
          fill: 'none',
          transition: 'stroke 0.3s ease',
        }}
        className="react-flow__edge-path"
        d={edgePath}
      />
      
      {/* Glowing marching pulse line */}
      <path
        style={{
          stroke: strokeColor,
          strokeWidth: 2,
          fill: 'none',
          strokeDasharray: '8, 12',
          animation: 'glowing-edge-pulse 1.2s linear infinite',
          filter: `drop-shadow(0px 0px 4px ${strokeColor})`,
        }}
        d={edgePath}
      />
    </>
  );
}
