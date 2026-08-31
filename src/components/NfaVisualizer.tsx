import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Move, Sparkles, Maximize2 } from 'lucide-react';
import { NFA } from '../types';

interface NfaVisualizerProps {
  nfa: NFA;
  highlightStates?: string[];
  highlightEdge?: { from: string; symbol: string; to: string };
}

interface NodePosition {
  x: number;
  y: number;
}

export const NfaVisualizer: React.FC<NfaVisualizerProps> = ({
  nfa,
  highlightStates = [],
  highlightEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  // Layout node positions
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});

  // Compute initial node positions in a clean circular / linear layout
  useEffect(() => {
    if (!nfa.states || nfa.states.length === 0) return;

    const count = nfa.states.length;
    const positions: Record<string, NodePosition> = {};
    const centerX = 360;
    const centerY = 200;

    if (count === 1) {
      positions[nfa.states[0]] = { x: centerX, y: centerY };
    } else if (count === 2) {
      positions[nfa.states[0]] = { x: 220, y: centerY };
      positions[nfa.states[1]] = { x: 500, y: centerY };
    } else if (count <= 4) {
      // Linear layout with start on left and final on right
      const spacing = 180;
      const startX = centerX - ((count - 1) * spacing) / 2;
      nfa.states.forEach((state, i) => {
        positions[state] = { x: startX + i * spacing, y: centerY };
      });
    } else {
      // Polygonal / Circular layout
      const radius = Math.min(180, 70 + count * 22);
      nfa.states.forEach((state, i) => {
        // Place start state on far left (angle PI)
        const angle = Math.PI - (i * 2 * Math.PI) / count;
        positions[state] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
    }

    setNodePositions(positions);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [nfa.states.join(',')]);

  // Group transitions between pairs of states
  const groupedTransitions = useMemo(() => {
    const map = new Map<string, { from: string; to: string; symbols: string[] }>();
    for (const t of nfa.transitions) {
      const key = `${t.from}-->${t.to}`;
      if (!map.has(key)) {
        map.set(key, { from: t.from, to: t.to, symbols: [] });
      }
      if (!map.get(key)!.symbols.includes(t.symbol)) {
        map.get(key)!.symbols.push(t.symbol);
      }
    }
    return Array.from(map.values());
  }, [nfa.transitions]);

  // Zoom In button handler
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.5, prev + 0.2));
  };

  // Zoom Out button handler
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.4, prev - 0.2));
  };

  // Reset View button handler
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node Dragging handlers
  const handleMouseDownNode = (state: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(state);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && nodePositions[draggingNode]) {
      const dx = e.movementX / zoom;
      const dy = e.movementY / zoom;
      setNodePositions((prev) => ({
        ...prev,
        [draggingNode]: {
          x: prev[draggingNode].x + dx,
          y: prev[draggingNode].y + dy,
        },
      }));
    } else if (isPanning) {
      setPan((prev) => ({
        x: prev.x + (e.clientX - startPan.x),
        y: prev.y + (e.clientY - startPan.y),
      }));
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleStartPan = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
  };

  const nodeRadius = 26;

  return (
    <section id="nfa-visualizer" className="w-full bg-[#13141f] border border-[#222538] rounded-xl p-4 sm:p-5 shadow-lg">
      {/* Header with Visualizer Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222538] mb-3.5">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>NFA Visualization Graph</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Interactive state graph • Drag nodes to reposition • Zoom & Pan
          </p>
        </div>

        {/* View Controls Toolbar */}
        <div className="flex items-center gap-1 bg-[#0d0e17] p-1 rounded-lg border border-[#222538] self-start sm:self-auto shadow-inner">
          <button
            id="zoom-in-btn"
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-[#1a1c2d] hover:bg-[#25283f] text-slate-300 hover:text-white border border-[#2d304a] transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            id="zoom-out-btn"
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-[#1a1c2d] hover:bg-[#25283f] text-slate-300 hover:text-white border border-[#2d304a] transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-[#26283d] mx-0.5" />
          <button
            id="reset-view-btn"
            onClick={handleResetView}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#1a1c2d] hover:bg-[#25283f] text-slate-300 hover:text-white text-[11px] font-medium border border-[#2d304a] transition-colors cursor-pointer"
            title="Reset Zoom & Pan (100%)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleStartPan}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[380px] bg-[#0d0e17] rounded-xl border border-[#222538] relative overflow-hidden cursor-grab active:cursor-grabbing shadow-inner select-none"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#5850ec15_1px,transparent_1px),linear-gradient(to_bottom,#5850ec15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Floating Canvas Legend */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#13141f]/90 backdrop-blur-sm border border-[#222538] rounded-lg p-1.5 text-[10px] text-slate-400 flex items-center gap-2.5 z-10 pointer-events-none">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600/60 border border-indigo-400" />
            State
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-double border-emerald-400 bg-emerald-950/40" />
            Final
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Start
          </span>
        </div>

        {/* Zoom percentage indicator */}
        <div className="absolute top-2.5 right-2.5 bg-[#13141f]/90 border border-[#222538] rounded-md px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>

        {/* SVG Drawing Layer */}
        <svg
          viewBox="0 0 720 400"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning || draggingNode ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Standard Arrow Marker */}
            <marker
              id="arrowhead-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
            </marker>

            {/* Highlighted Arrow Marker */}
            <marker
              id="arrowhead-highlight"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>

            {/* Start Arrow Marker */}
            <marker
              id="arrowhead-start"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Render Transitions */}
          {groupedTransitions.map((tGroup) => {
            const p1 = nodePositions[tGroup.from];
            const p2 = nodePositions[tGroup.to];
            if (!p1 || !p2) return null;

            const isSelfLoop = tGroup.from === tGroup.to;
            const labelText = tGroup.symbols.join(', ');

            const isEdgeHighlighted =
              highlightEdge &&
              highlightEdge.from === tGroup.from &&
              highlightEdge.to === tGroup.to &&
              tGroup.symbols.includes(highlightEdge.symbol);

            if (isSelfLoop) {
              // Self loop curve above node
              const loopR = 24;
              const x = p1.x;
              const y = p1.y - nodeRadius;

              const pathD = `M ${x - 12} ${y + 4} C ${x - loopR - 10} ${y - loopR * 2}, ${x + loopR + 10} ${y - loopR * 2}, ${x + 10} ${y + 2}`;

              return (
                <g key={`${tGroup.from}-${tGroup.to}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isEdgeHighlighted ? '#38bdf8' : '#6366f1'}
                    strokeWidth={isEdgeHighlighted ? 3 : 2}
                    markerEnd={isEdgeHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead-default)'}
                    className="transition-colors"
                  />
                  {/* Label */}
                  <rect
                    x={x - 14}
                    y={y - loopR * 2 - 12}
                    width={28}
                    height={18}
                    rx={5}
                    fill="#0f172a"
                    stroke={isEdgeHighlighted ? '#38bdf8' : '#475569'}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - loopR * 2}
                    fill={isEdgeHighlighted ? '#e0f2fe' : '#c7d2fe'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="monospace"
                  >
                    {labelText}
                  </text>
                </g>
              );
            }

            // Between two different states
            // Check if opposite edge exists to curve them separately
            const hasOpposite = groupedTransitions.some(
              (other) => other.from === tGroup.to && other.to === tGroup.from
            );

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return null;

            // Unit vector
            const ux = dx / dist;
            const uy = dy / dist;

            // Normal vector
            const nx = -uy;
            const ny = ux;

            // Offset for curved bidirectional edge
            const curveOffset = hasOpposite ? 28 : 0;

            const startX = p1.x + ux * nodeRadius + nx * (curveOffset > 0 ? 8 : 0);
            const startY = p1.y + uy * nodeRadius + ny * (curveOffset > 0 ? 8 : 0);

            const endX = p2.x - ux * (nodeRadius + 4) + nx * (curveOffset > 0 ? 8 : 0);
            const endY = p2.y - uy * (nodeRadius + 4) + ny * (curveOffset > 0 ? 8 : 0);

            let pathD = '';
            let labelX = 0;
            let labelY = 0;

            if (hasOpposite) {
              const midX = (p1.x + p2.x) / 2 + nx * curveOffset;
              const midY = (p1.y + p2.y) / 2 + ny * curveOffset;
              pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
              labelX = midX;
              labelY = midY;
            } else {
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              labelX = (p1.x + p2.x) / 2 + nx * 14;
              labelY = (p1.y + p2.y) / 2 + ny * 14;
            }

            const labelWidth = Math.max(22, labelText.length * 9 + 10);

            return (
              <g key={`${tGroup.from}-${tGroup.to}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isEdgeHighlighted ? '#38bdf8' : '#818cf8'}
                  strokeWidth={isEdgeHighlighted ? 3 : 2}
                  markerEnd={isEdgeHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead-default)'}
                  className="transition-colors"
                />
                {/* Edge Label Badge */}
                <rect
                  x={labelX - labelWidth / 2}
                  y={labelY - 9}
                  width={labelWidth}
                  height={18}
                  rx={5}
                  fill="#0f172a"
                  stroke={isEdgeHighlighted ? '#38bdf8' : '#475569'}
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY + 1}
                  fill={isEdgeHighlighted ? '#e0f2fe' : '#c7d2fe'}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="monospace"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          {/* Render Start State Pointer */}
          {nfa.startState && nodePositions[nfa.startState] && (
            <g>
              <line
                x1={nodePositions[nfa.startState].x - 65}
                y1={nodePositions[nfa.startState].y}
                x2={nodePositions[nfa.startState].x - nodeRadius - 4}
                y2={nodePositions[nfa.startState].y}
                stroke="#fbbf24"
                strokeWidth="2.5"
                markerEnd="url(#arrowhead-start)"
              />
              <rect
                x={nodePositions[nfa.startState].x - 85}
                y={nodePositions[nfa.startState].y - 20}
                width={38}
                height={16}
                rx={4}
                fill="#451a03"
                stroke="#b45309"
                strokeWidth="1"
              />
              <text
                x={nodePositions[nfa.startState].x - 66}
                y={nodePositions[nfa.startState].y - 9}
                fill="#fde68a"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="sans-serif"
              >
                start
              </text>
            </g>
          )}

          {/* Render State Nodes */}
          {nfa.states.map((state) => {
            const pos = nodePositions[state];
            if (!pos) return null;

            const isFinal = nfa.finalStates.includes(state);
            const isStart = state === nfa.startState;
            const isHighlighted = highlightStates.includes(state);
            const isDragging = draggingNode === state;

            return (
              <g
                key={state}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseDown={(e) => handleMouseDownNode(state, e)}
                className="cursor-move group"
              >
                {/* Active Highlight Glow Pulse */}
                {isHighlighted && (
                  <circle
                    r={nodeRadius + 9}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: '4s' }}
                  />
                )}

                {/* Outer / Main Circle */}
                <circle
                  r={nodeRadius}
                  fill={
                    isFinal
                      ? isHighlighted
                        ? '#065f46'
                        : '#064e3b'
                      : isHighlighted
                      ? '#312e81'
                      : '#1e1b4b'
                  }
                  stroke={
                    isHighlighted
                      ? '#38bdf8'
                      : isFinal
                      ? '#10b981'
                      : '#6366f1'
                  }
                  strokeWidth={isHighlighted ? 3 : 2.5}
                  className="transition-all shadow-md group-hover:filter group-hover:brightness-110"
                />

                {/* Double ring if Final state */}
                {isFinal && (
                  <circle
                    r={nodeRadius - 5}
                    fill="none"
                    stroke={isHighlighted ? '#38bdf8' : '#10b981'}
                    strokeWidth="1.5"
                  />
                )}

                {/* State Label Text */}
                <text
                  fill={
                    isHighlighted
                      ? '#ffffff'
                      : isFinal
                      ? '#a7f3d0'
                      : '#e0e7ff'
                  }
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {state}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
