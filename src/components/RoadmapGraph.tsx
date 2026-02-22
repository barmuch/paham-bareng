'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';

interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  type: string;
  position: { x: number; y: number };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    shape?: string;
    width?: number;
    height?: number;
  };
  resources?: { title: string; url: string; type: string }[];
  estimatedHours?: number;
  estimatedTimeUnit?: string;
}

interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  sourceAnchor?: 'top' | 'right' | 'bottom' | 'left';
  targetAnchor?: 'top' | 'right' | 'bottom' | 'left';
  style?: {
    lineColor?: string;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    strokeWidth?: number;
    arrowStart?: boolean;
    arrowEnd?: boolean;
    connector?: 'straight' | 'curved' | 'elbow';
  };
}

interface NodeProgress {
  nodeId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
}

interface Props {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  progress?: NodeProgress[];
  onNodeClick?: (nodeId: string, node: RoadmapNode) => void;
  interactive?: boolean;
}

const nodeTypeColors: Record<string, { bg: string; border: string }> = {
  // Match admin editor NODE_TYPES border colors; keep background neutral by default.
  topic: { bg: '#ffffff', border: '#3B82F6' },
  subtopic: { bg: '#ffffff', border: '#8B5CF6' },
  resource: { bg: '#ffffff', border: '#10B981' },
  milestone: { bg: '#ffffff', border: '#F59E0B' },
  checkpoint: { bg: '#ffffff', border: '#EF4444' },
};

const statusColors: Record<string, { bg: string; border: string }> = {
  'not-started': { bg: '#f8f9fa', border: '#dee2e6' },
  'in-progress': { bg: '#FEF3C7', border: '#F59E0B' },
  completed: { bg: '#D1FAE5', border: '#10B981' },
  skipped: { bg: '#F3F4F6', border: '#9CA3AF' },
};

export default function RoadmapGraph({ nodes, edges, progress, onNodeClick, interactive = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [graphHeight, setGraphHeight] = useState<number>(900);

  const computeRootNodeId = useCallback((): string | null => {
    if (!nodes?.length) return null;

    const incoming = new Map<string, number>();
    const outgoing = new Map<string, number>();
    for (const n of nodes) {
      incoming.set(n.id, 0);
      outgoing.set(n.id, 0);
    }
    for (const e of edges || []) {
      incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
      outgoing.set(e.source, (outgoing.get(e.source) ?? 0) + 1);
    }

    const roots = nodes.filter(n => (incoming.get(n.id) ?? 0) === 0);
    if (roots.length === 0) return nodes[0]?.id ?? null;

    // Prefer centering a "topic" root (usually the main topic).
    const topicRoots = roots.filter(r => r.type === 'topic');
    const candidates = topicRoots.length > 0 ? topicRoots : roots;

    candidates.sort((a, b) => (outgoing.get(b.id) ?? 0) - (outgoing.get(a.id) ?? 0));
    return candidates[0]?.id ?? null;
  }, [nodes, edges]);

  const computePositions = useCallback((): Map<string, { x: number; y: number }> => {
    const result = new Map<string, { x: number; y: number }>();
    const containerWidth = containerRef.current?.clientWidth ?? 1200;

    // Scale positions so nodes aren't too close.
    const X_SCALE = 1.65;
    const Y_SCALE = 1.75;

    // Add top offset so the legend doesn't cover first nodes.
    const TOP_OFFSET = 120;

    // Keep content inside container (no horizontal scroll needed).
    const SIDE_MARGIN = 120;

    const rootId = computeRootNodeId();

    // 1) scale + offset
    for (const n of nodes) {
      result.set(n.id, {
        x: n.position.x * X_SCALE,
        y: n.position.y * Y_SCALE + TOP_OFFSET,
      });
    }

    // 2) center root on x-axis
    if (rootId && result.has(rootId)) {
      const rootX = result.get(rootId)!.x;
      const deltaX = containerWidth / 2 - rootX;
      result.forEach((pos, id) => {
        result.set(id, { x: pos.x + deltaX, y: pos.y });
      });
    }

    // 3) ensure within margins (avoid clipping)
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    result.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    if (Number.isFinite(minX) && minX < SIDE_MARGIN) {
      const shift = SIDE_MARGIN - minX;
      result.forEach((pos, id) => {
        result.set(id, { x: pos.x + shift, y: pos.y });
      });
      maxX += shift;
      minX = SIDE_MARGIN;
    }

    if (Number.isFinite(maxX) && maxX > containerWidth - SIDE_MARGIN) {
      const shift = maxX - (containerWidth - SIDE_MARGIN);
      result.forEach((pos, id) => {
        result.set(id, { x: pos.x - shift, y: pos.y });
      });
      minX -= shift;
      maxX = containerWidth - SIDE_MARGIN;
    }

    // 4) compute height for vertical scrolling
    const paddingY = 220;
    const computedHeight = Number.isFinite(maxY) && Number.isFinite(minY)
      ? Math.max(900, Math.ceil(maxY - minY + paddingY))
      : 900;
    setGraphHeight(computedHeight);

    return result;
  }, [nodes, computeRootNodeId]);

  const getNodeStatus = useCallback((nodeId: string): string => {
    if (!progress) return 'not-started';
    const p = progress.find(p => p.nodeId === nodeId);
    return p?.status || 'not-started';
  }, [progress]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const cyElements: any[] = [];

    const positions = computePositions();

    // Add nodes
    nodes.forEach(node => {
      const status = getNodeStatus(node.id);
      const typeFallback = nodeTypeColors[node.type] || nodeTypeColors.topic;
      
      // Use status colors if status is not 'not-started', otherwise use node type colors
      let bgColor, borderColor;
      if (status !== 'not-started') {
        const statusColor = statusColors[status];
        bgColor = statusColor.bg;
        borderColor = statusColor.border;
      } else {
        bgColor = node.style?.backgroundColor || typeFallback.bg || '#ffffff';
        borderColor = node.style?.borderColor || typeFallback.border || '#3B82F6';
      }
      
      const textColor = node.style?.textColor || '#1F2937';
      const nodeWidth = node.style?.width ?? 180;
      const nodeHeight = node.style?.height ?? 55;
      const textMaxWidth = Math.max(80, Math.floor(nodeWidth - 40));

      cyElements.push({
        data: {
          id: node.id,
          label: node.label,
          nodeData: node,
          status,
          type: node.type,

          bgColor,
          borderColor,
          textColor,
          nodeWidth,
          nodeHeight,
          textMaxWidth,
        },
        position: positions.get(node.id) ?? { x: node.position.x, y: node.position.y },
      });
    });

    // Add edges (respect admin editor model)
    edges.forEach((edge, idx) => {
      const lineColor = edge.style?.lineColor || '#94a3b8';
      const lineStyle = edge.style?.lineStyle || 'solid';
      const strokeWidth = edge.style?.strokeWidth ?? 2;
      const connector = edge.style?.connector || 'straight';

      const curveStyle = connector === 'curved'
        ? 'bezier'
        : connector === 'elbow'
          ? 'segments'
          : 'straight';

      cyElements.push({
        data: {
          id: edge.id || `${edge.source}__${edge.target}__${idx}`,
          source: edge.source,
          target: edge.target,

          lineColor,
          lineStyle,
          strokeWidth,
          curveStyle,
          sourceArrowShape: edge.style?.arrowStart ? 'triangle' : 'none',
          targetArrowShape: edge.style?.arrowEnd ? 'triangle' : 'none',
        },
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '13px',
            'font-weight': '600',
            'font-family': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            color: 'data(textColor)',
            width: 'data(nodeWidth)',
            height: 'data(nodeHeight)',
            shape: 'roundrectangle',
            'background-color': 'data(bgColor)',
            'border-width': 3,
            'border-color': 'data(borderColor)',
            'text-wrap': 'wrap',
            'text-max-width': 'data(textMaxWidth)',
            'padding': '10px',
            'overlay-padding': '6px',
          } as any,
        },
        // Status styles - add visual emphasis
        {
          selector: 'node[status = "completed"]',
          style: {
            'border-width': 4,
          } as any,
        },
        {
          selector: 'node[status = "in-progress"]',
          style: {
            'border-width': 4,
            'border-style': 'dashed',
          } as any,
        },
        {
          selector: 'node[status = "skipped"]',
          style: {
            opacity: 0.6,
            'border-style': 'dotted',
          } as any,
        },
        {
          selector: 'edge',
          style: {
            width: 'data(strokeWidth)',
            'line-color': 'data(lineColor)',
            'line-style': 'data(lineStyle)',
            'curve-style': 'data(curveStyle)',
            'target-arrow-shape': 'data(targetArrowShape)',
            'source-arrow-shape': 'data(sourceArrowShape)',
            'target-arrow-color': 'data(lineColor)',
            'source-arrow-color': 'data(lineColor)',
            'arrow-scale': 1.2,
            'opacity': 0.95,
          } as any,
        },
        {
          selector: 'node:active',
          style: { 
            'overlay-color': '#3B82F6', 
            'overlay-opacity': 0.2,
          } as any,
        },
        {
          selector: 'node.hover',
          style: { 
            'border-width': 5, 
            'shadow-blur': 15, 
            'shadow-color': '#3B82F6', 
            'shadow-opacity': 0.5,
          } as any,
        },
        {
          selector: 'node.selected',
          style: {
            'border-width': 5,
            'border-color': '#8B5CF6',
            'shadow-blur': 20,
            'shadow-color': '#8B5CF6',
            'shadow-opacity': 0.6,
          } as any,
        },
      ],
      layout: { name: 'preset' },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabify: false,
      autounselectify: false,
    });

    // Events
    if (interactive && onNodeClick) {
      cy.on('tap', 'node', (evt: EventObject) => {
        const node = evt.target;
        const nodeData = node.data('nodeData');
        
        // Remove previous selection
        cy.nodes().removeClass('selected');
        // Add selection to clicked node
        node.addClass('selected');
        
        setSelectedNode(nodeData);
        onNodeClick(node.id(), nodeData);
      });
    }

    cy.on('mouseover', 'node', (evt: EventObject) => {
      evt.target.addClass('hover');
      if (containerRef.current) containerRef.current.style.cursor = 'pointer';
    });

    cy.on('mouseout', 'node', (evt: EventObject) => {
      evt.target.removeClass('hover');
      if (containerRef.current) containerRef.current.style.cursor = 'default';
    });

    // Tap on background to deselect
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        cy.nodes().removeClass('selected');
        setSelectedNode(null);
      }
    });

    // Fit to container width
    cy.fit(undefined, 40);

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, progress, onNodeClick, interactive, getNodeStatus, computePositions]);

  return (
    <div className="relative w-full bg-dark-50 rounded-xl border border-dark-200">
      <div
        ref={containerRef}
        className="cytoscape-container w-full"
        style={{ 
          height: graphHeight,
          minHeight: '900px',
        }}
      />

      {/* Compact Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-dark-200 p-3 z-10">
        <p className="text-xs font-semibold text-dark-800 mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          Legend
        </p>
        <div className="space-y-1.5">
          {progress ? (
            <>
              <div className="flex items-center gap-2 text-[11px] text-dark-700 font-medium">
                <span className="w-3 h-3 rounded border-2 border-dark-300 bg-white"></span> Belum Dimulai
              </div>
              <div className="flex items-center gap-2 text-[11px] text-dark-700 font-medium">
                <span className="w-3 h-3 rounded border-2 border-yellow-400 bg-yellow-100"></span> Sedang Belajar
              </div>
              <div className="flex items-center gap-2 text-[11px] text-dark-700 font-medium">
                <span className="w-3 h-3 rounded border-2 border-green-600 bg-green-200"></span> Selesai
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[11px] text-dark-700 font-medium">
                <span className="w-3 h-3 rounded-sm border-2 border-dark-800 bg-yellow-100"></span> Main Topic
              </div>
              <div className="flex items-center gap-2 text-[11px] text-dark-700 font-medium">
                <span className="w-3 h-3 rounded-sm border-2 border-dark-700 bg-yellow-50"></span> Subtopic
              </div>
              <div className="flex items-center gap-2 text-[11px] text-dark-700 font-medium">
                <span className="w-3 h-3 rounded-sm border-2 border-green-800 bg-green-300"></span> Milestone
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-primary-600/90 backdrop-blur-md rounded-lg shadow-lg border border-primary-500 px-3 py-2 max-w-xs z-10">
        <p className="text-[11px] text-white font-medium flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          Klik node untuk melihat detail • Scroll untuk melihat seluruh roadmap
        </p>
      </div>
    </div>
  );
}
