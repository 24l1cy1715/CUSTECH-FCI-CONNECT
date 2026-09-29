import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ListFilter,
  Network,
  Tag,
  FolderKanban,
  Star,
  Info,
} from 'lucide-react';
import {
  SkillGraphData,
  SkillGraphNode,
  SkillGraphLink,
  SKILL_CATEGORY_LABELS,
  PROFICIENCY_LABELS,
  SkillCategory,
  SkillProficiency,
} from '@/types/skills';
import { Badge } from '@/components/common/Badge';

interface SkillGraphVisualizerProps {
  graphData: SkillGraphData;
  studentName: string;
  onSelectSkill: (skillId: string) => void;
}

const CATEGORY_COLORS: Record<string, { fill: string; stroke: string; glow: string }> = {
  PROGRAMMING: { fill: '#3b82f6', stroke: '#60a5fa', glow: 'rgba(59, 130, 246, 0.4)' },
  WEB_DEVELOPMENT: { fill: '#06b6d4', stroke: '#22d3ee', glow: 'rgba(6, 182, 212, 0.4)' },
  CYBERSECURITY: { fill: '#ef4444', stroke: '#f87171', glow: 'rgba(239, 68, 68, 0.4)' },
  AI_MACHINE_LEARNING: { fill: '#8b5cf6', stroke: '#a78bfa', glow: 'rgba(139, 92, 246, 0.4)' },
  DATA_SCIENCE: { fill: '#a855f7', stroke: '#c084fc', glow: 'rgba(168, 85, 247, 0.4)' },
  DATABASE: { fill: '#f59e0b', stroke: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)' },
  UI_UX: { fill: '#ec4899', stroke: '#f472b6', glow: 'rgba(236, 72, 153, 0.4)' },
  CLOUD: { fill: '#14b8a6', stroke: '#2dd4bf', glow: 'rgba(20, 184, 166, 0.4)' },
  NETWORKING: { fill: '#6366f1', stroke: '#818cf8', glow: 'rgba(99, 102, 241, 0.4)' },
  DEFAULT: { fill: '#10b981', stroke: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' },
};

export const SkillGraphVisualizer: React.FC<SkillGraphVisualizerProps> = ({
  graphData,
  studentName,
  onSelectSkill,
}) => {
  const [viewMode, setViewMode] = useState<'GRAPH' | 'HIERARCHY'>('GRAPH');
  const [hoveredNode, setHoveredNode] = useState<SkillGraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const width = 800;
  const height = 520;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate layout coordinates for nodes
  const layout = useMemo(() => {
    const nodes: SkillGraphNode[] = graphData?.nodes || [];
    const links: SkillGraphLink[] = graphData?.links || [];

    const rootNode: SkillGraphNode = nodes.find((n: SkillGraphNode) => n.type === 'STUDENT') || {
      id: 'student-root',
      label: studentName,
      type: 'STUDENT',
    };

    const skillNodes = nodes.filter((n: SkillGraphNode) => n.type === 'SKILL');
    const projectNodes = nodes.filter((n: SkillGraphNode) => n.type === 'PROJECT');

    // Group skills by category to place them in orbital clusters
    const positions: Record<string, { x: number; y: number }> = {};

    // Center root student
    positions[rootNode.id] = { x: centerX, y: centerY };

    // Place skill nodes radially in an outer ring (radius 180)
    const skillRadius = 175;
    skillNodes.forEach((node: SkillGraphNode, idx: number) => {
      const angle = (idx / Math.max(1, skillNodes.length)) * 2 * Math.PI - Math.PI / 2;
      positions[node.id] = {
        x: centerX + Math.cos(angle) * skillRadius,
        y: centerY + Math.sin(angle) * skillRadius,
      };
    });

    // Place project nodes in outermost orbit connected to skills (radius 240)
    const projectRadius = 240;
    projectNodes.forEach((node: SkillGraphNode, idx: number) => {
      const angle =
        (idx / Math.max(1, projectNodes.length)) * 2 * Math.PI - Math.PI / 4;
      positions[node.id] = {
        x: centerX + Math.cos(angle) * projectRadius,
        y: centerY + Math.sin(angle) * projectRadius,
      };
    });

    return { rootNode, skillNodes, projectNodes, positions, links };
  }, [graphData, studentName, centerX, centerY]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Group skills by category for Hierarchy / Accessible view
  const categorizedSkills = useMemo(() => {
    const map = new Map<string, SkillGraphNode[]>();
    layout.skillNodes.forEach((skill: SkillGraphNode) => {
      const cat = skill.category || 'OTHER';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    });
    return map;
  }, [layout.skillNodes]);

  if (!graphData?.nodes || graphData.nodes.length <= 1) {
    return (
      <div className="p-8 text-center bg-surface-raised/30 rounded-2xl border border-dashed border-border space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent mx-auto flex items-center justify-center">
          <Network className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-text">No Skills Graph Available</h3>
        <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
          Add skills to your profile to visualize your knowledge graph and discover connections to projects.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Visualizer Toolbar */}
      <div className="p-4 border-b border-border bg-surface-raised/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
              Interactive Skill Graph
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold">
                Dynamic
              </span>
            </h3>
            <p className="text-[11px] text-text-muted">
              {layout.skillNodes.length} Skills • {layout.projectNodes.length} Projects
            </p>
          </div>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-surface border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('GRAPH')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'GRAPH'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text'
              }`}
              title="Graph View"
            >
              <Network className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Graph</span>
            </button>
            <button
              onClick={() => setViewMode('HIERARCHY')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'HIERARCHY'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text'
              }`}
              title="Hierarchy / Mobile View"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Tree</span>
            </button>
          </div>

          {viewMode === 'GRAPH' && (
            <div className="hidden sm:flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
                aria-label="Zoom in"
                className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
                aria-label="Zoom out"
                className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                aria-label="Reset view"
                className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'GRAPH' ? (
        <div
          className="relative w-full h-[460px] sm:h-[520px] bg-bg/95 overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full"
          >
            <defs>
              <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g
              transform={`translate(${pan.x + (width * (1 - zoom)) / 2}, ${
                pan.y + (height * (1 - zoom)) / 2
              }) scale(${zoom})`}
            >
              {/* Orbital guide circles */}
              <circle
                cx={centerX}
                cy={centerY}
                r={175}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 6"
                className="text-border opacity-40"
              />
              {layout.projectNodes.length > 0 && (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={240}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  className="text-border opacity-20"
                />
              )}

              {/* Links */}
              {layout.links.map((link: SkillGraphLink, idx: number) => {
                const sourcePos = layout.positions[link.source];
                const targetPos = layout.positions[link.target];
                if (!sourcePos || !targetPos) return null;

                const isConnectedToHovered =
                  hoveredNode &&
                  (hoveredNode.id === link.source || hoveredNode.id === link.target);

                return (
                  <line
                    key={idx}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={isConnectedToHovered ? '#10b981' : 'currentColor'}
                    strokeWidth={isConnectedToHovered ? 2.5 : 1.2}
                    strokeOpacity={isConnectedToHovered ? 0.9 : 0.25}
                    className="text-text-muted transition-all duration-200"
                  />
                );
              })}

              {/* Root Student Node */}
              <g
                transform={`translate(${centerX}, ${centerY})`}
                className="cursor-pointer"
              >
                <circle
                  r={32}
                  fill="url(#rootGlow)"
                  className="animate-pulse"
                  opacity={0.4}
                />
                <circle
                  r={24}
                  fill="#0f172a"
                  stroke="#10b981"
                  strokeWidth={2.5}
                />
                <text
                  textAnchor="middle"
                  dy={4}
                  className="fill-white text-[10px] font-bold tracking-wider uppercase pointer-events-none select-none"
                >
                  YOU
                </text>
              </g>

              {/* Project Nodes */}
              {layout.projectNodes.map((node: SkillGraphNode) => {
                const pos = layout.positions[node.id];
                if (!pos) return null;

                const isHovered = hoveredNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    <circle
                      r={14}
                      fill="#1e293b"
                      stroke="#f59e0b"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                    />
                    <text
                      textAnchor="middle"
                      dy={24}
                      className="fill-current text-text text-[10px] font-medium pointer-events-none select-none max-w-[80px]"
                    >
                      {node.label.length > 14
                        ? `${node.label.substring(0, 12)}…`
                        : node.label}
                    </text>
                  </g>
                );
              })}

              {/* Skill Nodes */}
              {layout.skillNodes.map((node: SkillGraphNode) => {
                const pos = layout.positions[node.id];
                if (!pos) return null;

                const catStyle =
                  CATEGORY_COLORS[node.category || ''] || CATEGORY_COLORS.DEFAULT;
                const isHovered = hoveredNode?.id === node.id;
                const isPrimary = node.isPrimary;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => onSelectSkill(node.id)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer group"
                  >
                    {/* Primary Star Halo */}
                    {isPrimary && (
                      <circle
                        r={22}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        className="animate-spin"
                        style={{ animationDuration: '10s' }}
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      r={isHovered ? 18 : 15}
                      fill={catStyle.fill}
                      stroke={catStyle.stroke}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-200"
                    />

                    {/* Skill Label */}
                    <text
                      textAnchor="middle"
                      dy={26}
                      className="fill-current text-text text-[11px] font-bold select-none pointer-events-none drop-shadow"
                    >
                      {node.label}
                    </text>

                    {/* Level Pill */}
                    {node.proficiency && (
                      <text
                        textAnchor="middle"
                        dy={38}
                        className="fill-text-muted text-[8px] font-mono select-none pointer-events-none"
                      >
                        {node.proficiency.slice(0, 3)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Hover Tooltip Card */}
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 p-3 rounded-xl bg-surface/95 border border-border backdrop-blur-md shadow-xl max-w-xs pointer-events-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-text">{hoveredNode.label}</span>
                {hoveredNode.isPrimary && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    PRIMARY
                  </span>
                )}
              </div>
              {hoveredNode.category && (
                <div className="text-[10px] text-text-muted mt-0.5">
                  Category: {SKILL_CATEGORY_LABELS[hoveredNode.category]}
                </div>
              )}
              {hoveredNode.proficiency && (
                <div className="text-[10px] font-medium text-accent mt-0.5">
                  Proficiency: {PROFICIENCY_LABELS[hoveredNode.proficiency].label}
                </div>
              )}
              <div className="text-[9px] text-text-muted mt-1 italic">
                Click node to view full skill details &amp; peers
              </div>
            </motion.div>
          )}

          {/* Info pill */}
          <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/80 border border-border text-[11px] text-text-muted backdrop-blur-sm pointer-events-none">
            <Info className="w-3 h-3 text-accent" />
            <span>Drag to pan • Click node to inspect</span>
          </div>
        </div>
      ) : (
        /* Accessible Responsive Hierarchy View */
        <div className="p-6 space-y-6 max-h-[520px] overflow-y-auto">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-xs text-text-secondary leading-relaxed">
            <strong className="text-text font-bold block mb-1">Knowledge Hierarchy View</strong>
            Skills are organized by domain categories and mapped to your featured projects. Click any skill to explore enrolled students and project details.
          </div>

          <div className="space-y-4">
            {Array.from(categorizedSkills.entries()).map(([cat, skills]) => (
              <div
                key={cat}
                className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {SKILL_CATEGORY_LABELS[cat as SkillCategory] || cat}
                  </h4>
                  <span className="text-[11px] text-text-muted font-mono">
                    {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {skills.map((sk: SkillGraphNode) => {
                    const prof = sk.proficiency ? PROFICIENCY_LABELS[sk.proficiency as SkillProficiency] : null;
                    return (
                      <button
                        key={sk.id}
                        onClick={() => onSelectSkill(sk.id)}
                        className="p-3 rounded-xl bg-surface border border-border text-left hover:border-accent hover:shadow-sm transition-all flex items-center justify-between gap-2 group"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-text truncate group-hover:text-accent flex items-center gap-1">
                            {sk.label}
                            {sk.isPrimary && (
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          {prof && (
                            <span className="text-[10px] text-text-muted block mt-0.5">
                              {prof.label}
                            </span>
                          )}
                        </div>

                        {prof && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${prof.color}`}
                          >
                            {prof.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
