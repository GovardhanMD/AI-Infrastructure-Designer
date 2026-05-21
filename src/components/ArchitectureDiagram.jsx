"use client";

import { useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Background, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import CustomCloudNode from './CustomCloudNode';
import GlowingEdge from './GlowingEdge';
import styles from './Components.module.css';

const NODE_TYPES = {
  cloudNode: CustomCloudNode,
};

const EDGE_TYPES = {
  glowingEdge: GlowingEdge,
};

// Sub-component to access ReactFlow hook
function FlowCanvas({ data }) {
  const { fitView } = useReactFlow();

  const nodes = useMemo(() => {
    return (data?.nodes || []).map(node => ({
      ...node,
      type: 'cloudNode', // Force our custom high-fidelity cloud node type
    }));
  }, [data]);

  const edges = useMemo(() => {
    return (data?.edges || []).map(edge => ({
      ...edge,
      type: 'glowingEdge', // Force our glowing custom edge path type
    }));
  }, [data]);

  // Fit the diagram when the dataset updates
  useEffect(() => {
    if (nodes.length) {
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 800 });
      }, 100);
    }
  }, [nodes, fitView]);

  return (
    <ReactFlow 
      nodes={nodes} 
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }} // Cleanly removes bottom-right watermark
      className="react-flow-premium-dark"
    >
      {/* Premium subtle grid backdrop */}
      <Background color="rgba(255, 255, 255, 0.03)" gap={20} size={1} />
      
      {/* Customized controls panel positioned elegantly on the left */}
      <Controls 
        position="bottom-left" 
        showInteractive={false}
        className="!m-4 !border !border-white/10 !bg-black/80 !backdrop-blur-md !rounded-xl !overflow-hidden !shadow-2xl"
      />
    </ReactFlow>
  );
}

export default function ArchitectureDiagram({ data }) {
  if (!data || !data.nodes || !data.nodes.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 font-light gap-2">
        <svg className="animate-spin h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Rendering Architecture Canvas...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={styles.diagramWrapper}
      style={{
        border: '1px solid var(--glass-border)',
        background: 'rgba(5, 5, 5, 0.6)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <ReactFlowProvider>
        <FlowCanvas data={data} />
      </ReactFlowProvider>
    </motion.div>
  );
}
