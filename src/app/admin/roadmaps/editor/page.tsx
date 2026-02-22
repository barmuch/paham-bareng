'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FiSave, FiArrowLeft, FiPlus, FiTrash2, FiLink,
  FiZoomIn, FiZoomOut, FiMaximize, FiSettings,
  FiX, FiChevronDown, FiExternalLink, FiBookOpen,
  FiMousePointer, FiMove, FiSliders, FiMinimize2
} from 'react-icons/fi';

interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  type: 'topic' | 'subtopic' | 'resource' | 'milestone' | 'checkpoint';
  position: { x: number; y: number };
  style?: { backgroundColor?: string; borderColor?: string; width?: number; height?: number };
  resources?: { title: string; url: string; type: string }[];
  prerequisites?: string[];
  estimatedHours?: number;
  estimatedTimeUnit?: 'hours' | 'minutes';
}

interface RoadmapEdge {
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
    curveControlOffset?: { x: number; y: number }; // Offset from default control point
  };
}

interface RoadmapData {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  isPublished?: boolean;
}

const CATEGORIES = [
  // Islamic learning categories
  'aqidah', 'fiqh', 'sirah', 'quran', 'hadith', 'akhlaq', 'tazkiyah', 'arabic',
  // Original (tech) categories (kept for compatibility)
  'frontend', 'backend', 'devops', 'mobile', 'ai-ml',
  'blockchain', 'cybersecurity', 'database', 'cloud',
  'game-dev', 'data-science', 'design',
  // Fallback
  'other'
];

const NODE_TYPES: { value: RoadmapNode['type']; label: string; color: string }[] = [
  { value: 'topic', label: 'Topic', color: '#3B82F6' },
  { value: 'subtopic', label: 'Subtopic', color: '#8B5CF6' },
  { value: 'resource', label: 'Resource', color: '#10B981' },
  { value: 'milestone', label: 'Milestone', color: '#F59E0B' },
  { value: 'checkpoint', label: 'Checkpoint', color: '#EF4444' },
];

const NODE_SIZES = [
  { value: 'small', label: 'Small', width: 140, height: 50 },
  { value: 'medium', label: 'Medium', width: 180, height: 50 },
  { value: 'large', label: 'Large', width: 240, height: 60 },
  { value: 'xlarge', label: 'Extra Large', width: 300, height: 70 },
];

const DEFAULT_NODE: Omit<RoadmapNode, 'id' | 'position'> = {
  label: 'New Node',
  description: '',
  type: 'topic',
  resources: [],
  prerequisites: [],
  estimatedHours: 1,
  estimatedTimeUnit: 'hours',
};

const DEFAULT_NODE_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: '#3B82F6',
  width: 180,
  height: 50,
};

export default function RoadmapEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const editId = searchParams.get('id');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [showSettings, setShowSettings] = useState(!editId);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [tool, setTool] = useState<'pointer' | 'hand' | 'link'>('pointer');
  const [workspaceMaximized, setWorkspaceMaximized] = useState(false);
  const workspaceRestoreRef = useRef<{ showSettings: boolean; settingsCollapsed: boolean; showNodePanel: boolean } | null>(null);
  const [guidesEnabled, setGuidesEnabled] = useState(true);

  const [roadmap, setRoadmap] = useState<RoadmapData>({
    title: '',
    description: '',
    icon: '🗺️',
    category: 'aqidah',
    tags: [],
    nodes: [],
    edges: [],
    isPublished: false,
  });

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeIndices, setSelectedEdgeIndices] = useState<number[]>([]);
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState<number | null>(null);
  const [linkDrag, setLinkDrag] = useState<null | {
    sourceId: string;
    sourceAnchor: 'top' | 'right' | 'bottom' | 'left';
    cursor: { x: number; y: number };
  }>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    nodeId: string | null;
    nodeIds: string[];
    startPositions: Record<string, { x: number; y: number }>;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  }>({ isDragging: false, nodeId: null, nodeIds: [], startPositions: {}, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  const [edgeDrag, setEdgeDrag] = useState<null | {
    edgeIndex: number;
    endpoint: 'source' | 'target';
    cursor: { x: number; y: number };
  }>(null);

  const [curveDrag, setCurveDrag] = useState<null | {
    edgeIndex: number;
    startOffset: { x: number; y: number };
    startMouseWorld: { x: number; y: number };
  }>(null);

  const [marquee, setMarquee] = useState<null | {
    active: boolean;
    startClient: { x: number; y: number };
    currentClient: { x: number; y: number };
    additive: boolean;
  }>(null);

  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tagInput, setTagInput] = useState('');
  const [nodeSizes, setNodeSizes] = useState<Record<string, { width: number; height: number }>>({});
  const nodeSizesObserverRef = useRef<ResizeObserver | null>(null);
  const nodeBoxRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const clientToWorld = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - viewport.x) / viewport.scale,
      y: (clientY - rect.top - viewport.y) / viewport.scale,
    };
  };

  const getNodeDims = (node: RoadmapNode) => {
    // Prioritize style width/height during resize for immediate feedback
    if (node.style?.width || node.style?.height) {
      const measured = nodeSizes[node.id];
      return {
        width: node.style.width ?? measured?.width ?? 180,
        height: node.style.height ?? measured?.height ?? 50,
      };
    }
    const measured = nodeSizes[node.id];
    return {
      width: measured?.width ?? node.style?.width ?? 180,
      height: measured?.height ?? node.style?.height ?? 50,
    };
  };

  const getNodeRectWorld = (node: RoadmapNode) => {
    // Always use node.position for coordinates to ensure consistency
    // Use measured dimensions if available, otherwise fall back to style or defaults
    const dims = getNodeDims(node);
    return { 
      x: node.position.x, 
      y: node.position.y, 
      width: dims.width, 
      height: dims.height 
    };
  };

  const pickAnchorFromPoint = (node: RoadmapNode, point: { x: number; y: number }) => {
    const rect = getNodeRectWorld(node);
    const left = rect.x;
    const top = rect.y;
    const right = left + rect.width;
    const bottom = top + rect.height;

    const dLeft = Math.abs(point.x - left);
    const dRight = Math.abs(point.x - right);
    const dTop = Math.abs(point.y - top);
    const dBottom = Math.abs(point.y - bottom);

    const min = Math.min(dLeft, dRight, dTop, dBottom);
    if (min === dLeft) return 'left' as const;
    if (min === dRight) return 'right' as const;
    if (min === dTop) return 'top' as const;
    return 'bottom' as const;
  };

  const getAnchorPoint = (node: RoadmapNode, anchor: 'top' | 'right' | 'bottom' | 'left') => {
    const rect = getNodeRectWorld(node);
    const x = rect.x;
    const y = rect.y;
    const width = rect.width;
    const height = rect.height;

    switch (anchor) {
      case 'left':
        return { x, y: y + height / 2 };
      case 'right':
        return { x: x + width, y: y + height / 2 };
      case 'top':
        return { x: x + width / 2, y };
      case 'bottom':
        return { x: x + width / 2, y: y + height };
    }
  };

  const getDefaultAnchors = (src: RoadmapNode, tgt: RoadmapNode) => {
    const sourceAnchor: 'top' | 'right' | 'bottom' | 'left' = src.position.x <= tgt.position.x ? 'right' : 'left';
    const targetAnchor: 'top' | 'right' | 'bottom' | 'left' = src.position.x <= tgt.position.x ? 'left' : 'right';
    return { sourceAnchor, targetAnchor };
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    nodeSizesObserverRef.current?.disconnect();
    const observer = new ResizeObserver((entries) => {
      setNodeSizes((prev) => {
        let next = prev;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset.nodeBox;
          if (!id) continue;

          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          const current = prev[id];
          if (current && Math.abs(current.width - width) < 0.5 && Math.abs(current.height - height) < 0.5) continue;

          if (next === prev) next = { ...prev };
          next[id] = { width, height };
        }
        return next;
      });
    });

    nodeSizesObserverRef.current = observer;
    const els = canvasRef.current.querySelectorAll<HTMLElement>('[data-node-box]');
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [roadmap.nodes.length]);

  // Resource editing
  const [editingResource, setEditingResource] = useState<{
    title: string; url: string; type: string;
  }>({ title: '', url: '', type: 'article' });

  // Load existing roadmap
  useEffect(() => {
    if (editId) {
      loadRoadmap(editId);
    }
  }, [editId]);

  const loadRoadmap = async (id: string) => {
    try {
      const { data: res } = await adminAPI.getRoadmap(id);
      const found = res?.data ?? res?.roadmap ?? null;
      if (!found) throw new Error('Roadmap not found');
      setRoadmap({
        _id: found._id,
        title: found.title,
        description: found.description,
        icon: found.icon || '🗺️',
        category: found.category,
        tags: found.tags || [],
        nodes: found.nodes || [],
        edges: found.edges || [],
        isPublished: !!found.isPublished,
      });
      setShowSettings(false);
    } catch {
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  // --- Node Operations ---
  const addNode = () => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? (canvasRect.width / 2 - viewport.x) / viewport.scale : 400;
    const centerY = canvasRect ? (canvasRect.height / 2 - viewport.y) / viewport.scale : 300;

    const newNode: RoadmapNode = {
      ...DEFAULT_NODE,
      id: `node_${Date.now()}`,
      position: {
        x: centerX + Math.random() * 80 - 40,
        y: centerY + Math.random() * 80 - 40,
      },
      style: {
        ...DEFAULT_NODE_STYLE,
        width: 180,
        height: 50,
      },
    };
    setRoadmap(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeIds([newNode.id]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeIndices([]);
    setSelectedEdgeIndex(null);
  };

  const updateNode = (nodeId: string, updates: Partial<RoadmapNode>) => {
    setRoadmap(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
    }));
  };

  const deleteNode = (nodeId: string) => {
    const node = roadmap.nodes.find((n) => n.id === nodeId);
    if (node && isNodeContentDirty(node)) {
      const ok = confirm('Node ini sudah diedit dari nilai default. Yakin mau hapus?');
      if (!ok) return;
    }
    setRoadmap(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    }));
    setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setShowNodePanel(false);
  };

  const deleteNodes = (nodeIds: string[]) => {
    const nodesToDelete = roadmap.nodes.filter((n) => nodeIds.includes(n.id));
    const anyDirty = nodesToDelete.some((n) => isNodeContentDirty(n));
    if (anyDirty) {
      const ok = confirm(
        nodeIds.length > 1
          ? 'Beberapa node sudah diedit dari nilai default. Yakin mau hapus semuanya?'
          : 'Node ini sudah diedit dari nilai default. Yakin mau hapus?'
      );
      if (!ok) return;
    }
    const setIds = new Set(nodeIds);
    setRoadmap((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => !setIds.has(n.id)),
      edges: prev.edges.filter((e) => !setIds.has(e.source) && !setIds.has(e.target)),
    }));
    setSelectedNodeIds([]);
    setSelectedNodeId(null);
    setShowNodePanel(false);
  };

  const isNodeContentDirty = (node: RoadmapNode) => {
    if ((node.label || '') !== DEFAULT_NODE.label) return true;
    if ((node.description || '') !== DEFAULT_NODE.description) return true;
    if ((node.type || 'topic') !== DEFAULT_NODE.type) return true;

    const resources = node.resources || [];
    const prerequisites = node.prerequisites || [];
    if (resources.length > 0) return true;
    if (prerequisites.length > 0) return true;
    if ((node.estimatedHours ?? DEFAULT_NODE.estimatedHours) !== DEFAULT_NODE.estimatedHours) return true;

    const style = node.style || {};
    if (
      (style.backgroundColor && style.backgroundColor !== DEFAULT_NODE_STYLE.backgroundColor) ||
      (style.borderColor && style.borderColor !== DEFAULT_NODE_STYLE.borderColor) ||
      (typeof style.width === 'number' && style.width !== DEFAULT_NODE_STYLE.width) ||
      (typeof style.height === 'number' && style.height !== DEFAULT_NODE_STYLE.height)
    ) {
      return true;
    }

    return false;
  };

  const addEdge = (source: string, target: string) => {
    if (source === target) return;
    const exists = roadmap.edges.some(e => e.source === source && e.target === target);
    if (exists) return;
    setRoadmap(prev => ({
      ...prev,
      edges: [...prev.edges, { source, target, style: { lineColor: '#94a3b8', lineStyle: 'solid', strokeWidth: 1.5, arrowStart: false, arrowEnd: false, connector: 'straight' } }],
    }));
  };

  const addAnchoredEdge = (
    source: string,
    target: string,
    sourceAnchor: 'top' | 'right' | 'bottom' | 'left',
    targetAnchor: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    if (source === target) return;
    const exists = roadmap.edges.some(e => e.source === source && e.target === target);
    if (exists) return;
    setRoadmap(prev => ({
      ...prev,
      edges: [
        ...prev.edges,
        { source, target, sourceAnchor, targetAnchor, style: { lineColor: '#94a3b8', lineStyle: 'solid', strokeWidth: 1.5, arrowStart: false, arrowEnd: false, connector: 'straight' } },
      ],
    }));
  };

  const updateEdge = (edgeIndex: number, updates: Partial<RoadmapEdge>) => {
    setRoadmap(prev => ({
      ...prev,
      edges: prev.edges.map((e, i) => (i === edgeIndex ? { ...e, ...updates } : e)),
    }));
  };

  const deleteEdge = (source: string, target: string) => {
    setRoadmap(prev => ({
      ...prev,
      edges: prev.edges.filter(e => !(e.source === source && e.target === target)),
    }));
  };

  const deleteEdgesByIndex = (indices: number[]) => {
    const sorted = [...indices].sort((a, b) => b - a);
    setRoadmap((prev) => {
      let nextEdges = prev.edges;
      for (const idx of sorted) {
        if (idx < 0 || idx >= nextEdges.length) continue;
        nextEdges = nextEdges.filter((_, i) => i !== idx);
      }
      return { ...prev, edges: nextEdges };
    });
    setSelectedEdgeIndices([]);
    setSelectedEdgeIndex(null);
  };

  // --- Canvas Interactions ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (tool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      return;
    }

    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      if (tool === 'pointer') {
        const additive = e.shiftKey;
        setMarquee({
          active: true,
          startClient: { x: e.clientX, y: e.clientY },
          currentClient: { x: e.clientX, y: e.clientY },
          additive,
        });
        if (!additive) {
          setSelectedNodeIds([]);
          setSelectedNodeId(null);
          setSelectedEdgeIndices([]);
          setSelectedEdgeIndex(null);
          setShowNodePanel(false);
        }
        return;
      }

      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      setSelectedNodeIds([]);
      setSelectedNodeId(null);
      setSelectedEdgeIndices([]);
      setSelectedEdgeIndex(null);
      setShowNodePanel(false);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
    }

    if (linkDrag) {
      const world = clientToWorld(e.clientX, e.clientY);
      setLinkDrag({ ...linkDrag, cursor: world });
    }

    if (edgeDrag) {
      const world = clientToWorld(e.clientX, e.clientY);
      setEdgeDrag({ ...edgeDrag, cursor: world });
      return;
    }

    if (curveDrag) {
      const world = clientToWorld(e.clientX, e.clientY);
      const edge = roadmap.edges[curveDrag.edgeIndex];
      if (edge) {
        // Calculate delta from initial mouse position
        const dx = world.x - curveDrag.startMouseWorld.x;
        const dy = world.y - curveDrag.startMouseWorld.y;
        
        // Apply delta to initial offset
        const newOffsetX = curveDrag.startOffset.x + dx;
        const newOffsetY = curveDrag.startOffset.y + dy;
        
        updateEdge(curveDrag.edgeIndex, {
          style: { ...edge.style, curveControlOffset: { x: newOffsetX, y: newOffsetY } }
        });
      }
      return;
    }

    if (marquee?.active) {
      setMarquee({ ...marquee, currentClient: { x: e.clientX, y: e.clientY } });
      return;
    }

    if (dragState.isDragging && dragState.nodeId) {
      const dx = (e.clientX - dragState.startX) / viewport.scale;
      const dy = (e.clientY - dragState.startY) / viewport.scale;

      const baseX = dragState.offsetX + dx;
      const baseY = dragState.offsetY + dy;

      const movingNode = roadmap.nodes.find(n => n.id === dragState.nodeId);
      if (!guidesEnabled || !movingNode) {
        updateNode(dragState.nodeId, { position: { x: baseX, y: baseY } });
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) {
        updateNode(dragState.nodeId, { position: { x: baseX, y: baseY } });
        return;
      }

      const viewportCenterXWorld = (rect.width / 2 - viewport.x) / viewport.scale;
      const viewportCenterYWorld = (rect.height / 2 - viewport.y) / viewport.scale;
      const { width } = getNodeDims(movingNode);
      const { height } = getNodeDims(movingNode);
      const nodeCenterX = baseX + width / 2;
      const nodeCenterY = baseY + height / 2;
      const threshold = 8 / viewport.scale;

      const snappedX = Math.abs(nodeCenterX - viewportCenterXWorld) <= threshold
        ? viewportCenterXWorld - width / 2
        : baseX;

      const snappedY = Math.abs(nodeCenterY - viewportCenterYWorld) <= threshold
        ? viewportCenterYWorld - height / 2
        : baseY;

      const startPrimary = dragState.startPositions[dragState.nodeId] || { x: dragState.offsetX, y: dragState.offsetY };
      const appliedDx = snappedX - startPrimary.x;
      const appliedDy = snappedY - startPrimary.y;

      setRoadmap((prev) => {
        const startPositions = dragState.startPositions;
        return {
          ...prev,
          nodes: prev.nodes.map((n) => {
            if (!dragState.nodeIds.includes(n.id)) return n;
            const sp = startPositions[n.id];
            if (!sp) return n;
            return {
              ...n,
              position: {
                x: sp.x + appliedDx,
                y: sp.y + appliedDy,
              },
            };
          }),
        };
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (linkDrag) {
      setLinkDrag(null);
    }
    if (edgeDrag) {
      // Don't reconnect yet - wait for drop on node
      setEdgeDrag(null);
    }
    if (curveDrag) {
      setCurveDrag(null);
    }
    if (marquee?.active) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const x1 = Math.min(marquee.startClient.x, marquee.currentClient.x);
        const y1 = Math.min(marquee.startClient.y, marquee.currentClient.y);
        const x2 = Math.max(marquee.startClient.x, marquee.currentClient.x);
        const y2 = Math.max(marquee.startClient.y, marquee.currentClient.y);

        const p1 = clientToWorld(x1, y1);
        const p2 = clientToWorld(x2, y2);
        const minX = Math.min(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxX = Math.max(p1.x, p2.x);
        const maxY = Math.max(p1.y, p2.y);

        const hit = roadmap.nodes
          .filter((n) => {
            const r = getNodeRectWorld(n);
            const rx2 = r.x + r.width;
            const ry2 = r.y + r.height;
            const intersects = !(rx2 < minX || r.x > maxX || ry2 < minY || r.y > maxY);
            return intersects;
          })
          .map((n) => n.id);

        setSelectedNodeIds((prev) => {
          if (marquee.additive) {
            const s = new Set(prev);
            hit.forEach((id) => s.add(id));
            return Array.from(s);
          }
          return hit;
        });
        setSelectedNodeId(hit.length === 1 ? hit[0] : null);
        if (hit.length !== 1) setShowNodePanel(false);
      }
      setMarquee(null);
    }
    if (dragState.isDragging) {
      setDragState({ isDragging: false, nodeId: null, nodeIds: [], startPositions: {}, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = roadmap.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (tool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      return;
    }

    if (tool === 'link') {
      const world = clientToWorld(e.clientX, e.clientY);
      const sourceAnchor = pickAnchorFromPoint(node, world);
      setSelectedNodeId(nodeId);
      setSelectedEdgeIndex(null);
      setLinkDrag({ sourceId: nodeId, sourceAnchor, cursor: world });
      return;
    }

    const isAlreadySelected = selectedNodeIds.includes(nodeId);
    const dragIds = isAlreadySelected && selectedNodeIds.length > 0 ? selectedNodeIds : [nodeId];
    if (!isAlreadySelected) {
      setSelectedNodeIds([nodeId]);
      setSelectedNodeId(nodeId);
      setSelectedEdgeIndices([]);
      setSelectedEdgeIndex(null);
    }

    const startPositions: Record<string, { x: number; y: number }> = {};
    for (const id of dragIds) {
      const n = roadmap.nodes.find((nn) => nn.id === id);
      if (n) startPositions[id] = { x: n.position.x, y: n.position.y };
    }

    setDragState({
      isDragging: true,
      nodeId,
      nodeIds: dragIds,
      startPositions,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: node.position.x,
      offsetY: node.position.y,
    });
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!dragState.isDragging) {
      if (e.shiftKey) {
        setSelectedNodeIds((prev) => {
          const s = new Set(prev);
          if (s.has(nodeId)) s.delete(nodeId);
          else s.add(nodeId);
          return Array.from(s);
        });
        setSelectedNodeId(nodeId);
      } else {
        setSelectedNodeIds([nodeId]);
        setSelectedNodeId(nodeId);
      }

      setSelectedEdgeIndices([]);
      setSelectedEdgeIndex(null);
    }
  };

  useEffect(() => {
    // When switching away from link tool, clear linking state.
    if (tool !== 'link' && linkDrag) {
      setLinkDrag(null);
      toast.dismiss();
    }
  }, [tool, linkDrag]);

  // Debug: log selected edge changes
  useEffect(() => {
    if (selectedEdgeIndex !== null || selectedEdgeIndices.length > 0) {
      // Removed excessive logging for performance
    }
  }, [selectedEdgeIndex, selectedEdgeIndices, tool, roadmap.edges.length]);

  const zoomAt = (delta: number, clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      setViewport((prev) => ({ ...prev, scale: Math.max(0.25, Math.min(2, prev.scale + delta)) }));
      return;
    }

    setViewport((prev) => {
      const nextScale = Math.max(0.25, Math.min(2, prev.scale + delta));
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const worldX = (screenX - prev.x) / prev.scale;
      const worldY = (screenY - prev.y) / prev.scale;
      const nextX = screenX - worldX * nextScale;
      const nextY = screenY - worldY * nextScale;
      return { x: nextX, y: nextY, scale: nextScale };
    });
  };

  const zoom = (delta: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      zoomAt(delta, 0, 0);
      return;
    }
    zoomAt(delta, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== 'Backspace' && ev.key !== 'Delete') return;

      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();
      const isTyping =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (active?.isContentEditable ?? false);
      if (isTyping) return;

      if (selectedEdgeIndices.length > 0) {
        ev.preventDefault();
        deleteEdgesByIndex(selectedEdgeIndices);
        return;
      }

      if (selectedEdgeIndex !== null) {
        ev.preventDefault();
        deleteEdgesByIndex([selectedEdgeIndex]);
        return;
      }

      if (selectedNodeIds.length > 0) {
        ev.preventDefault();
        deleteNodes(selectedNodeIds);
        return;
      }

      if (selectedNodeId) {
        ev.preventDefault();
        deleteNodes([selectedNodeId]);
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedEdgeIndex, selectedEdgeIndices, selectedNodeId, selectedNodeIds]);

  const fitView = () => {
    if (roadmap.nodes.length === 0) return;
    const xs = roadmap.nodes.map(n => n.position.x);
    const ys = roadmap.nodes.map(n => n.position.y);
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 300;
    const minY = Math.min(...ys) - 100;
    const maxY = Math.max(...ys) + 200;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    const scale = Math.min(scaleX, scaleY, 1);
    setViewport({
      scale,
      x: (rect.width - (maxX - minX) * scale) / 2 - minX * scale,
      y: (rect.height - (maxY - minY) * scale) / 2 - minY * scale,
    });
  };

  // --- Save ---
  const handleSave = async () => {
    if (!roadmap.title.trim()) {
      toast.error('Title is required');
      setShowSettings(true);
      return;
    }
    setSaving(true);
    try {
      if (roadmap._id) {
        await adminAPI.updateRoadmap(roadmap._id, {
          title: roadmap.title,
          description: roadmap.description,
          icon: roadmap.icon,
          category: roadmap.category,
          tags: roadmap.tags,
        });
        await adminAPI.updateRoadmapNodes(roadmap._id, {
          nodes: roadmap.nodes,
          edges: roadmap.edges,
        });

        await adminAPI.publishRoadmap(roadmap._id, !!roadmap.isPublished);
        toast.success('Roadmap updated!');
      } else {
        const { data } = await adminAPI.createRoadmap({
          ...roadmap,
        });
        const newId = data.data._id;
        setRoadmap(prev => ({ ...prev, _id: newId }));

        if (roadmap.isPublished) {
          await adminAPI.publishRoadmap(newId, true);
        }
        toast.success('Roadmap created!');
        router.replace(`/admin/roadmaps/editor?id=${newId}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const selectedNode = roadmap.nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = selectedEdgeIndex !== null ? roadmap.edges[selectedEdgeIndex] : null;

  const addResource = () => {
    if (!selectedNodeId || !editingResource.title || !editingResource.url) return;
    updateNode(selectedNodeId, {
      resources: [...(selectedNode?.resources || []), { ...editingResource }],
    });
    setEditingResource({ title: '', url: '', type: 'article' });
  };

  const removeResource = (idx: number) => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, {
      resources: (selectedNode?.resources || []).filter((_, i) => i !== idx),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-dark-200 px-4 py-2 flex items-center gap-3 z-10">
        <button
          onClick={() => router.push('/admin/roadmaps')}
          className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
        >
          <FiArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-dark-900 truncate">
            {roadmap.title || 'Untitled Roadmap'}
          </h2>
          <p className="text-xs text-dark-500">{roadmap.nodes.length} nodes • {roadmap.edges.length} edges</p>
        </div>
        {/* Tools */}
        <div className="flex items-center gap-1 bg-dark-50 border border-dark-200 rounded-lg p-1">
          <button
            onClick={() => setTool('pointer')}
            className={`p-2 rounded-md transition-colors ${tool === 'pointer' ? 'bg-white text-dark-900' : 'text-dark-600 hover:bg-white'}`}
            title="Pointer (select & drag)"
          >
            <FiMousePointer size={16} />
          </button>
          <button
            onClick={() => setTool('hand')}
            className={`p-2 rounded-md transition-colors ${tool === 'hand' ? 'bg-white text-dark-900' : 'text-dark-600 hover:bg-white'}`}
            title="Hand (pan)"
          >
            <FiMove size={16} />
          </button>
          <button
            onClick={() => {
              setTool('link');
              setLinkDrag(null);
              toast.dismiss();
            }}
            className={`p-2 rounded-md transition-colors ${tool === 'link' ? 'bg-white text-dark-900' : 'text-dark-600 hover:bg-white'}`}
            title="Link nodes (drag from source to target)"
          >
            <FiLink size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            if (workspaceMaximized) {
              const restore = workspaceRestoreRef.current;
              setWorkspaceMaximized(false);
              if (restore) {
                setShowNodePanel(restore.showNodePanel);
              }
            }

            setShowSettings((v) => {
              const next = !v;
              if (next) setSettingsCollapsed(false);
              return next;
            });
          }}
          className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-primary-50 text-primary-600' : 'hover:bg-dark-100'}`}
          title="Roadmap Settings"
        >
          <FiSettings size={18} />
        </button>
        <button
          onClick={() => {
            if (selectedNodeIds.length !== 1) {
              toast('Select a node first', { icon: '🧩' });
              return;
            }
            setShowNodePanel((v) => !v);
          }}
          className={`p-2 rounded-lg transition-colors ${showNodePanel ? 'bg-primary-50 text-primary-600' : 'hover:bg-dark-100'}`}
          title="Node Properties"
        >
          <FiSliders size={18} />
        </button>

        <button
          onClick={() => setGuidesEnabled(v => !v)}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${guidesEnabled ? 'bg-dark-100 text-dark-900' : 'hover:bg-dark-100 text-dark-700'}`}
          title="Toggle center guide & snapping"
        >
          Guides
        </button>

        <div className="h-6 w-px bg-dark-200" />
        <button
          onClick={addNode}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-100 hover:bg-dark-200 rounded-lg text-sm transition-colors"
        >
          <FiPlus size={14} /> Add Node
        </button>
        <div className="h-6 w-px bg-dark-200" />
        <button onClick={() => zoom(0.1)} className="p-1.5 hover:bg-dark-100 rounded" title="Zoom In"><FiZoomIn size={16} /></button>
        <span className="text-xs text-dark-500 w-10 text-center">{Math.round(viewport.scale * 100)}%</span>
        <button onClick={() => zoom(-0.1)} className="p-1.5 hover:bg-dark-100 rounded" title="Zoom Out"><FiZoomOut size={16} /></button>
        <button onClick={fitView} className="p-1.5 hover:bg-dark-100 rounded" title="Fit View"><FiMaximize size={16} /></button>
        <div className="h-6 w-px bg-dark-200" />
        <button
          onClick={() => {
            if (!workspaceMaximized) {
              workspaceRestoreRef.current = { showSettings, settingsCollapsed, showNodePanel };
              setShowSettings(false);
              setShowNodePanel(false);
              setWorkspaceMaximized(true);
              return;
            }

            const restore = workspaceRestoreRef.current;
            setWorkspaceMaximized(false);
            if (restore) {
              setShowSettings(restore.showSettings);
              setSettingsCollapsed(restore.settingsCollapsed);
              setShowNodePanel(restore.showNodePanel);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-100 hover:bg-dark-200 rounded-lg text-sm transition-colors"
          title={workspaceMaximized ? 'Restore panels' : 'Maximize editor workspace'}
        >
          {workspaceMaximized ? <FiMinimize2 size={14} /> : <FiMaximize size={14} />}
          {workspaceMaximized ? 'Restore' : 'Maximize'}
        </button>
        <div className="h-6 w-px bg-dark-200" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary !py-1.5 !px-4 !text-sm flex items-center gap-1.5"
        >
          <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Panel */}
        {showSettings && !workspaceMaximized && (
          <div className={`${settingsCollapsed ? 'w-14' : 'w-80'} bg-white border-r border-dark-200 overflow-y-auto transition-[width] duration-200`}>
            <div className={`p-4 border-b border-dark-200 flex items-center justify-between ${settingsCollapsed ? 'flex-col gap-2' : ''}`}>
              {!settingsCollapsed ? (
                <h3 className="font-semibold text-dark-900">Roadmap Settings</h3>
              ) : (
                <FiSettings className="text-dark-500" size={18} />
              )}

              <button
                onClick={() => setSettingsCollapsed(v => !v)}
                className="p-1.5 hover:bg-dark-100 rounded"
                title={settingsCollapsed ? 'Expand settings' : 'Collapse settings'}
              >
                <FiChevronDown className={`${settingsCollapsed ? '-rotate-90' : ''} transition-transform`} size={16} />
              </button>
            </div>

            {!settingsCollapsed && (
              <div className="p-4 space-y-4">

            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Icon</label>
              <input
                type="text"
                value={roadmap.icon}
                onChange={(e) => setRoadmap(prev => ({ ...prev, icon: e.target.value }))}
                className="input-field !text-2xl !py-1 w-20 text-center"
                maxLength={2}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Title *</label>
              <input
                type="text"
                value={roadmap.title}
                onChange={(e) => setRoadmap(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Description</label>
              <textarea
                value={roadmap.description}
                onChange={(e) => setRoadmap(prev => ({ ...prev, description: e.target.value }))}
                className="input-field !h-24 resize-none"
                placeholder="Describe this roadmap..."
              />
            </div>

            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Category</label>
              <select
                value={roadmap.category}
                onChange={(e) => setRoadmap(prev => ({ ...prev, category: e.target.value }))}
                className="input-field"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div className="border border-dark-200 rounded-lg p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!roadmap.isPublished}
                  onChange={(e) => setRoadmap(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-dark-800">Publish</div>
                  <div className="text-xs text-dark-500">
                    Jika aktif, roadmap akan muncul di halaman user setelah klik Save.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="text-xs font-medium text-dark-600 mb-1 block">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {roadmap.tags.map((tag, i) => (
                  <span key={i} className="badge bg-primary-50 text-primary-700 flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => setRoadmap(prev => ({ ...prev, tags: prev.tags.filter((_, idx) => idx !== i) }))}
                      className="hover:text-red-500"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      setRoadmap(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                      setTagInput('');
                    }
                  }}
                  className="input-field !text-sm flex-1"
                  placeholder="Add tag..."
                />
                <button
                  onClick={() => {
                    if (tagInput.trim()) {
                      setRoadmap(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                      setTagInput('');
                    }
                  }}
                  className="btn-primary !py-1.5 !px-3 !text-sm"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
              </div>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 bg-dark-50 overflow-hidden relative admin-editor-canvas"
          style={{
            cursor:
              isPanning ? 'grabbing' :
              tool === 'hand' ? 'grab' :
              tool === 'link' ? 'crosshair' :
              'default',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {marquee?.active && (() => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return null;
            const x1 = Math.min(marquee.startClient.x, marquee.currentClient.x) - rect.left;
            const y1 = Math.min(marquee.startClient.y, marquee.currentClient.y) - rect.top;
            const x2 = Math.max(marquee.startClient.x, marquee.currentClient.x) - rect.left;
            const y2 = Math.max(marquee.startClient.y, marquee.currentClient.y) - rect.top;
            return (
              <div
                className="absolute pointer-events-none border-2 border-primary-500 bg-primary-100/40 shadow-lg"
                style={{ left: x1, top: y1, width: x2 - x1, height: y2 - y1 }}
              />
            );
          })()}

          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
              transformOrigin: '0 0',
              overflow: 'visible',
            }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="context-stroke" />
              </marker>
              <marker id="arrowtail" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="10 0, 0 3.5, 10 7" fill="context-stroke" />
              </marker>
            </defs>

            {guidesEnabled && dragState.isDragging && (() => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return null;
              const viewportCenterXWorld = (rect.width / 2 - viewport.x) / viewport.scale;
              const viewportCenterYWorld = (rect.height / 2 - viewport.y) / viewport.scale;
              return (
                <g>
                  <line
                    x1={viewportCenterXWorld}
                    y1={-10000}
                    x2={viewportCenterXWorld}
                    y2={10000}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="4 6"
                  />
                  <line
                    x1={-10000}
                    y1={viewportCenterYWorld}
                    x2={10000}
                    y2={viewportCenterYWorld}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="4 6"
                  />
                </g>
              );
            })()}

            {roadmap.edges.map((edge, i) => {
              const src = roadmap.nodes.find(n => n.id === edge.source);
              const tgt = roadmap.nodes.find(n => n.id === edge.target);
              if (!src || !tgt) return null;
              const defaults = getDefaultAnchors(src, tgt);
              const sp = getAnchorPoint(src, edge.sourceAnchor || defaults.sourceAnchor);
              const tp = getAnchorPoint(tgt, edge.targetAnchor || defaults.targetAnchor);
              const lineStyle = edge.style?.lineStyle || 'solid';
              const dasharray = lineStyle === 'dashed' ? '8 6' : lineStyle === 'dotted' ? '2 6' : undefined;
              const strokeWidth = edge.style?.strokeWidth ?? 1.5;
              const lineColor = edge.style?.lineColor || '#94a3b8';
              const arrowStart = !!edge.style?.arrowStart;
              const arrowEnd = !!edge.style?.arrowEnd;
              const connector = edge.style?.connector || 'straight';
              const isEdgeSelected = selectedEdgeIndices.includes(i) || selectedEdgeIndex === i;

              // Highlight styling for selected edges
              const displayStrokeWidth = isEdgeSelected ? strokeWidth + 3 : strokeWidth;
              const displayLineColor = isEdgeSelected ? '#3B82F6' : lineColor;
              const displayOpacity = isEdgeSelected ? 1 : 0.85;

              let d: string | null = null;
              let controlPoint: { x: number; y: number } | null = null;
              
              if (connector === 'curved') {
                const mx = (sp.x + tp.x) / 2;
                const my = (sp.y + tp.y) / 2;
                const dx = tp.x - sp.x;
                const dy = tp.y - sp.y;
                const len = Math.max(1, Math.hypot(dx, dy));
                const nx = -dy / len;
                const ny = dx / len;
                const bend = 60;
                
                // Apply custom offset if set
                const offset = edge.style?.curveControlOffset || { x: 0, y: 0 };
                const cx = mx + nx * bend + offset.x;
                const cy = my + ny * bend + offset.y;
                controlPoint = { x: cx, y: cy };
                
                d = `M ${sp.x} ${sp.y} Q ${cx} ${cy} ${tp.x} ${tp.y}`;
              } else if (connector === 'elbow') {
                const midX = (sp.x + tp.x) / 2;
                d = `M ${sp.x} ${sp.y} L ${midX} ${sp.y} L ${midX} ${tp.y} L ${tp.x} ${tp.y}`;
              }

              return (
                <g key={i}>
                  {d ? (
                    <>
                      <path
                        d={d}
                        fill="none"
                        stroke={displayLineColor}
                        strokeWidth={displayStrokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={dasharray}
                        markerStart={arrowStart ? 'url(#arrowtail)' : undefined}
                        markerEnd={arrowEnd ? 'url(#arrowhead)' : undefined}
                        opacity={displayOpacity}
                      />
                      <path
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        className="pointer-events-auto cursor-pointer"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedNodeIds([]);
                          setSelectedNodeId(null);
                          setShowNodePanel(false);

                          if (ev.shiftKey) {
                            setSelectedEdgeIndices((prev) => {
                              const s = new Set(prev);
                              if (s.has(i)) s.delete(i);
                              else s.add(i);
                              return Array.from(s);
                            });
                            setSelectedEdgeIndex(i);
                            return;
                          }

                          setSelectedEdgeIndices([i]);
                          setSelectedEdgeIndex(i);
                        }}
                      />
                      {/* Edge endpoint handles when in pointer mode and edge is selected */}
                      {tool === 'pointer' && isEdgeSelected && (
                        <>
                          {/* Glow effect */}
                          <circle cx={sp.x} cy={sp.y} r={12} fill="#3B82F6" opacity={0.15} />
                          <circle
                            cx={sp.x}
                            cy={sp.y}
                            r={9}
                            fill="white"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            className="pointer-events-auto cursor-grab"
                            onMouseDown={(ev) => {
                              ev.stopPropagation();
                              const world = clientToWorld(ev.clientX, ev.clientY);
                              setEdgeDrag({ edgeIndex: i, endpoint: 'source', cursor: world });
                            }}
                          />
                          <circle cx={tp.x} cy={tp.y} r={12} fill="#3B82F6" opacity={0.15} />
                          <circle
                            cx={tp.x}
                            cy={tp.y}
                            r={9}
                            fill="white"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            className="pointer-events-auto cursor-grab"
                            onMouseDown={(ev) => {
                              ev.stopPropagation();
                              const world = clientToWorld(ev.clientX, ev.clientY);
                              setEdgeDrag({ edgeIndex: i, endpoint: 'target', cursor: world });
                            }}
                          />
                        </>
                      )}
                      {/* Curve control point handle for curved edges */}
                      {tool === 'pointer' && isEdgeSelected && connector === 'curved' && controlPoint && (
                        <>
                          <circle cx={controlPoint.x} cy={controlPoint.y} r={10} fill="#10B981" opacity={0.15} />
                          <circle
                            cx={controlPoint.x}
                            cy={controlPoint.y}
                            r={7}
                            fill="white"
                            stroke="#10B981"
                            strokeWidth={2.5}
                            className="pointer-events-auto cursor-move"
                            onMouseDown={(ev) => {
                              ev.stopPropagation();
                              const world = clientToWorld(ev.clientX, ev.clientY);
                              setCurveDrag({
                                edgeIndex: i,
                                startOffset: edge.style?.curveControlOffset || { x: 0, y: 0 },
                                startMouseWorld: world,
                              });
                            }}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <line
                        x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                        stroke={displayLineColor}
                        strokeWidth={displayStrokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={dasharray}
                        markerStart={arrowStart ? 'url(#arrowtail)' : undefined}
                        markerEnd={arrowEnd ? 'url(#arrowhead)' : undefined}
                        opacity={displayOpacity}
                      />
                      <line
                        x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                        stroke="transparent"
                        strokeWidth={14}
                        className="pointer-events-auto cursor-pointer"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setSelectedNodeIds([]);
                          setSelectedNodeId(null);
                          setShowNodePanel(false);

                          if (ev.shiftKey) {
                            setSelectedEdgeIndices((prev) => {
                              const s = new Set(prev);
                              if (s.has(i)) s.delete(i);
                              else s.add(i);
                              return Array.from(s);
                            });
                            setSelectedEdgeIndex(i);
                            return;
                          }

                          setSelectedEdgeIndices([i]);
                          setSelectedEdgeIndex(i);
                        }}
                      />
                      {/* Edge endpoint handles when in pointer mode and edge is selected */}
                      {tool === 'pointer' && isEdgeSelected && (
                        <>
                          {/* Glow effect */}
                          <circle cx={sp.x} cy={sp.y} r={12} fill="#3B82F6" opacity={0.15} />
                          <circle
                            cx={sp.x}
                            cy={sp.y}
                            r={9}
                            fill="white"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            className="pointer-events-auto cursor-grab"
                            onMouseDown={(ev) => {
                              ev.stopPropagation();
                              const world = clientToWorld(ev.clientX, ev.clientY);
                              setEdgeDrag({ edgeIndex: i, endpoint: 'source', cursor: world });
                            }}
                          />
                          <circle cx={tp.x} cy={tp.y} r={12} fill="#3B82F6" opacity={0.15} />
                          <circle
                            cx={tp.x}
                            cy={tp.y}
                            r={9}
                            fill="white"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            className="pointer-events-auto cursor-grab"
                            onMouseDown={(ev) => {
                              ev.stopPropagation();
                              const world = clientToWorld(ev.clientX, ev.clientY);
                              setEdgeDrag({ edgeIndex: i, endpoint: 'target', cursor: world });
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                </g>
              );
            })}

            {linkDrag && (() => {
              const src = roadmap.nodes.find(n => n.id === linkDrag.sourceId);
              if (!src) return null;
              const sp = getAnchorPoint(src, linkDrag.sourceAnchor);
              return (
                <line
                  x1={sp.x}
                  y1={sp.y}
                  x2={linkDrag.cursor.x}
                  y2={linkDrag.cursor.y}
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              );
            })()}

            {edgeDrag && (() => {
              const edge = roadmap.edges[edgeDrag.edgeIndex];
              if (!edge) return null;
              const src = roadmap.nodes.find(n => n.id === edge.source);
              const tgt = roadmap.nodes.find(n => n.id === edge.target);
              if (!src || !tgt) return null;

              const defaults = getDefaultAnchors(src, tgt);
              const sp = getAnchorPoint(src, edge.sourceAnchor || defaults.sourceAnchor);
              const tp = getAnchorPoint(tgt, edge.targetAnchor || defaults.targetAnchor);

              const start = edgeDrag.endpoint === 'source' ? edgeDrag.cursor : { x: sp.x, y: sp.y };
              const end = edgeDrag.endpoint === 'target' ? edgeDrag.cursor : { x: tp.x, y: tp.y };

              return (
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              );
            })()}
          </svg>

          {/* Nodes */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
              transformOrigin: '0 0',
              pointerEvents: 'none', // Allow clicks to pass through to edges below
            }}
          >
            {roadmap.nodes.map(node => {
              const nodeType = NODE_TYPES.find(t => t.value === node.type);
              const isSelected = selectedNodeIds.includes(node.id);
              const isConnecting = linkDrag?.sourceId === node.id;
              return (
                <div
                  key={node.id}
                  className="absolute select-none"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: isSelected ? 10 : 1,
                    pointerEvents: 'auto', // Re-enable for nodes
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onMouseUp={(e) => {
                    // Handle link tool edge creation
                    if (linkDrag && tool === 'link') {
                      e.stopPropagation();
                      const source = linkDrag.sourceId;
                      const target = node.id;
                      if (source === target) {
                        setLinkDrag(null);
                        return;
                      }

                      const targetNode = roadmap.nodes.find(n => n.id === target);
                      if (!targetNode) {
                        setLinkDrag(null);
                        return;
                      }

                      const world = clientToWorld(e.clientX, e.clientY);
                      const targetAnchor = pickAnchorFromPoint(targetNode, world);
                      addAnchoredEdge(source, target, linkDrag.sourceAnchor, targetAnchor);
                      setLinkDrag(null);
                      return;
                    }

                    // Handle edge endpoint dragging reconnection
                    if (edgeDrag) {
                      e.stopPropagation();
                      const edge = roadmap.edges[edgeDrag.edgeIndex];
                      if (!edge) {
                        setEdgeDrag(null);
                        return;
                      }

                      const world = clientToWorld(e.clientX, e.clientY);
                      const anchor = pickAnchorFromPoint(node, world);

                      if (edgeDrag.endpoint === 'source') {
                        // Don't allow reconnecting to the same target
                        if (node.id === edge.target) {
                          setEdgeDrag(null);
                          return;
                        }
                        updateEdge(edgeDrag.edgeIndex, {
                          source: node.id,
                          sourceAnchor: anchor,
                        });
                      } else {
                        // Don't allow reconnecting to the same source
                        if (node.id === edge.source) {
                          setEdgeDrag(null);
                          return;
                        }
                        updateEdge(edgeDrag.edgeIndex, {
                          target: node.id,
                          targetAnchor: anchor,
                        });
                      }
                      setEdgeDrag(null);
                      return;
                    }
                  }}
                  onClick={(e) => {
                    handleNodeClick(e, node.id);
                  }}
                >
                  <div
                    className={`relative px-4 py-2.5 rounded-lg shadow-md border-2 cursor-move transition-shadow min-w-[140px] max-w-[220px] ${
                      isSelected ? 'ring-2 ring-primary-400 shadow-lg' : ''
                    } ${isConnecting ? 'ring-2 ring-blue-400 animate-pulse' : ''}`}
                    data-node-box={node.id}
                    ref={(el) => {
                      nodeBoxRefs.current[node.id] = el;
                    }}
                    style={{
                      backgroundColor: node.style?.backgroundColor || '#ffffff',
                      borderColor: node.style?.borderColor || nodeType?.color || '#3B82F6',
                      width: node.style?.width,
                      height: node.style?.height,
                    }}
                  >
                    {tool === 'link' && (
                      <>
                        {(['top', 'right', 'bottom', 'left'] as const).map((anchor) => {
                          const posClass =
                            anchor === 'top'
                              ? 'left-1/2 -top-2 -translate-x-1/2'
                              : anchor === 'right'
                                ? '-right-2 top-1/2 -translate-y-1/2'
                                : anchor === 'bottom'
                                  ? 'left-1/2 -bottom-2 -translate-x-1/2'
                                  : '-left-2 top-1/2 -translate-y-1/2';

                          return (
                            <button
                              key={anchor}
                              type="button"
                              className={`absolute ${posClass} h-4 w-4 rounded-full bg-white border border-dark-300 shadow-sm pointer-events-auto`}
                              title={`Anchor: ${anchor}`}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                const world = clientToWorld(e.clientX, e.clientY);
                                setSelectedNodeIds([node.id]);
                                setSelectedNodeId(node.id);
                                setSelectedEdgeIndices([]);
                                setSelectedEdgeIndex(null);
                                setTool('link');
                                setLinkDrag({ sourceId: node.id, sourceAnchor: anchor, cursor: world });
                              }}
                            />
                          );
                        })}
                      </>
                    )}

                    <div className="flex items-center gap-2 mb-0.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: nodeType?.color }}
                      />
                      <span className="text-xs text-dark-400 uppercase font-medium">{node.type}</span>
                    </div>
                    <p className="text-sm font-semibold text-dark-900 leading-tight break-words">
                      {node.label}
                    </p>
                    {node.estimatedHours && node.estimatedHours > 0 && (
                      <p className="text-[10px] text-dark-400 mt-1">
                        {node.estimatedHours}{node.estimatedTimeUnit === 'minutes' ? 'm' : 'h'} estimated
                      </p>
                    )}


                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {roadmap.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <FiBookOpen className="mx-auto text-dark-300 mb-3" size={48} />
                <p className="text-dark-400 text-lg font-medium">Start building your roadmap</p>
                <p className="text-dark-400 text-sm mt-1">Click "Add Node" to create your first topic</p>
              </div>
            </div>
          )}
        </div>

        {/* Node Properties Panel */}
        {showNodePanel && selectedNode && (
          <div className="w-80 bg-white border-l border-dark-200 overflow-y-auto">
            <div className="p-4 border-b border-dark-200 flex items-center justify-between">
              <h3 className="font-semibold text-dark-900">Node Properties</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500"
                  title="Delete node"
                >
                  <FiTrash2 size={14} />
                </button>
                <button
                  onClick={() => {
                    setShowNodePanel(false);
                    setSelectedNodeIds([]);
                    setSelectedNodeId(null);
                  }}
                  className="p-1.5 hover:bg-dark-100 rounded"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Label *</label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                  className="input-field !text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Type</label>
                <select
                  value={selectedNode.type}
                  onChange={(e) => updateNode(selectedNode.id, { type: e.target.value as any })}
                  className="input-field !text-sm"
                >
                  {NODE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Size</label>
                <select
                  value={
                    NODE_SIZES.find(s => 
                      s.width === selectedNode.style?.width && 
                      s.height === selectedNode.style?.height
                    )?.value || 'medium'
                  }
                  onChange={(e) => {
                    const size = NODE_SIZES.find(s => s.value === e.target.value);
                    if (size) {
                      updateNode(selectedNode.id, {
                        style: { 
                          ...selectedNode.style, 
                          width: size.width, 
                          height: size.height 
                        }
                      });
                    }
                  }}
                  className="input-field !text-sm"
                >
                  {NODE_SIZES.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({s.width}×{s.height}px)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Description</label>
                <textarea
                  value={selectedNode.description || ''}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  className="input-field !text-sm !h-20 resize-none"
                  placeholder="Describe this topic..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Estimated Time</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={selectedNode.estimatedHours || 0}
                    onChange={(e) => updateNode(selectedNode.id, { estimatedHours: parseFloat(e.target.value) || 0 })}
                    className="input-field !text-sm w-24"
                  />
                  <select
                    value={selectedNode.estimatedTimeUnit || 'hours'}
                    onChange={(e) => updateNode(selectedNode.id, { estimatedTimeUnit: e.target.value as 'hours' | 'minutes' })}
                    className="input-field !text-sm w-28"
                  >
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="text-xs font-medium text-dark-600 mb-2 block">Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-dark-400">Background</span>
                    <input
                      type="color"
                      value={selectedNode.style?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateNode(selectedNode.id, {
                        style: { ...selectedNode.style, backgroundColor: e.target.value }
                      })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-400">Border</span>
                    <input
                      type="color"
                      value={selectedNode.style?.borderColor || NODE_TYPES.find(t => t.value === selectedNode.type)?.color || '#3B82F6'}
                      onChange={(e) => updateNode(selectedNode.id, {
                        style: { ...selectedNode.style, borderColor: e.target.value }
                      })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Prerequisites</label>
                <div className="space-y-1">
                  {roadmap.edges
                    .filter(e => e.target === selectedNode.id)
                    .map(e => {
                      const src = roadmap.nodes.find(n => n.id === e.source);
                      return src ? (
                        <div key={e.source} className="flex items-center gap-2 text-xs bg-dark-50 px-2 py-1 rounded">
                          <FiLink size={10} className="text-dark-400" />
                          <span className="flex-1">{src.label}</span>
                          <button
                            onClick={() => deleteEdge(e.source, e.target)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ) : null;
                    })}
                  {roadmap.edges.filter(e => e.target === selectedNode.id).length === 0 && (
                    <p className="text-xs text-dark-400">No prerequisites. Use "Link Nodes" to connect.</p>
                  )}
                </div>
              </div>

              {/* Resources */}
              <div>
                <label className="text-xs font-medium text-dark-600 mb-2 block">
                  Resources ({selectedNode.resources?.length || 0})
                </label>
                <div className="space-y-1.5 mb-2">
                  {(selectedNode.resources || []).map((res, i) => (
                    <div key={i} className="flex items-center gap-2 bg-dark-50 px-2 py-1.5 rounded text-xs">
                      <FiExternalLink size={10} className="text-dark-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{res.title}</p>
                        <p className="text-dark-400 truncate">{res.url}</p>
                      </div>
                      <span className="badge bg-dark-200 text-dark-600 !text-[10px]">{res.type}</span>
                      <button onClick={() => removeResource(i)} className="text-red-400 hover:text-red-600">
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 border border-dark-200 rounded-lg p-2">
                  <input
                    type="text"
                    value={editingResource.title}
                    onChange={(e) => setEditingResource(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field !text-xs !py-1"
                    placeholder="Resource title"
                  />
                  <input
                    type="url"
                    value={editingResource.url}
                    onChange={(e) => setEditingResource(prev => ({ ...prev, url: e.target.value }))}
                    className="input-field !text-xs !py-1"
                    placeholder="https://..."
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={editingResource.type}
                      onChange={(e) => setEditingResource(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field !text-xs !py-1 flex-1"
                    >
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="course">Course</option>
                      <option value="documentation">Docs</option>
                      <option value="github">GitHub</option>
                      <option value="tool">Tool</option>
                    </select>
                    <button
                      onClick={addResource}
                      className="btn-primary !py-1 !px-3 !text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edge Properties Panel */}
        {!workspaceMaximized && selectedEdge && selectedEdgeIndex !== null && (
          <div className="w-80 bg-white border-l border-dark-200 overflow-y-auto">
            <div className="p-4 border-b border-dark-200 flex items-center justify-between">
              <h3 className="font-semibold text-dark-900">Edge Style</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    if (confirm('Delete this connection?')) {
                      deleteEdgesByIndex([selectedEdgeIndex]);
                    }
                  }}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500"
                  title="Delete edge"
                >
                  <FiTrash2 size={14} />
                </button>
                <button
                  onClick={() => {
                    setSelectedEdgeIndices([]);
                    setSelectedEdgeIndex(null);
                  }}
                  className="p-1.5 hover:bg-dark-100 rounded"
                  title="Close"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Connector</label>
                <select
                  value={selectedEdge.style?.connector || 'straight'}
                  onChange={(e) => updateEdge(selectedEdgeIndex, {
                    style: { ...selectedEdge.style, connector: e.target.value as any },
                  })}
                  className="input-field !text-sm"
                >
                  <option value="straight">Straight</option>
                  <option value="curved">Curved</option>
                  <option value="elbow">Elbow</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-2 block">Color</label>
                <input
                  type="color"
                  value={selectedEdge.style?.lineColor || '#94a3b8'}
                  onChange={(e) => updateEdge(selectedEdgeIndex, {
                    style: { ...selectedEdge.style, lineColor: e.target.value },
                  })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Line Style</label>
                <select
                  value={selectedEdge.style?.lineStyle || 'solid'}
                  onChange={(e) => updateEdge(selectedEdgeIndex, {
                    style: { ...selectedEdge.style, lineStyle: e.target.value as any },
                  })}
                  className="input-field !text-sm"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-dark-600 mb-1 block">Stroke Width</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.5}
                  value={selectedEdge.style?.strokeWidth ?? 1.5}
                  onChange={(e) => updateEdge(selectedEdgeIndex, {
                    style: { ...selectedEdge.style, strokeWidth: parseFloat(e.target.value) || 1.5 },
                  })}
                  className="input-field !text-sm w-28"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-dark-600 block">Arrow</label>
                  <p className="text-[11px] text-dark-400">Show arrowhead at end</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!selectedEdge.style?.arrowEnd}
                  onChange={(e) => updateEdge(selectedEdgeIndex, {
                    style: { ...selectedEdge.style, arrowEnd: e.target.checked },
                  })}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-dark-600 block">Arrow Start</label>
                  <p className="text-[11px] text-dark-400">Show arrowhead at start</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!selectedEdge.style?.arrowStart}
                  onChange={(e) => updateEdge(selectedEdgeIndex, {
                    style: { ...selectedEdge.style, arrowStart: e.target.checked },
                  })}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
