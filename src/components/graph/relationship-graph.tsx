'use client'

import { useState, useMemo, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { motion, AnimatePresence } from 'motion/react'
import { X, Users, Building2, Tag, BookOpen, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface GraphNode {
  id: string
  label: string
  data: {
    name: string
    company: string | null
    headline: string | null
    stage: string
    tags: string[]
    interactionCount: number
    lastInteraction: string | null
  }
}

interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  data: {
    type: 'event' | 'company' | 'tag' | 'paper'
    context: string
  }
}

interface RelationshipGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const STAGE_COLORS: Record<string, string> = {
  NEW: '#9CA3AF',
  CONNECTED: '#3B82F6',
  CHATTED: '#10B981',
  ONGOING: '#14B8A6',
  INNER_CIRCLE: '#8B5CF6',
}

const EDGE_COLORS: Record<string, string> = {
  event: '#F59E0B',
  company: '#3B82F6',
  tag: '#10B981',
  paper: '#8B5CF6',
}

export function RelationshipGraph({ nodes, edges }: RelationshipGraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)

  // Normalize inputs: ensure nodes and edges are arrays
  const normalizedNodes = Array.isArray(nodes) ? nodes : []
  const normalizedEdges = Array.isArray(edges) ? edges : []

  // Transform nodes for force graph
  const graphNodes = useMemo(() => {
    if (!normalizedNodes || normalizedNodes.length === 0) return []
    return normalizedNodes
      .filter((node) => {
        return (
          node &&
          typeof node === 'object' &&
          node.id &&
          typeof node.id === 'string' &&
          node.data &&
          typeof node.data === 'object' &&
          node.data.stage &&
          typeof node.data.stage === 'string'
        )
      })
      .map((node) => {
        const stageColor = STAGE_COLORS[node.data.stage] || STAGE_COLORS.NEW
        return {
          id: String(node.id),
          name: String(node.label || node.data.name || ''),
          color: stageColor,
          stage: node.data.stage,
          data: node.data,
        }
      })
  }, [normalizedNodes])

  // Transform edges for force graph
  const graphEdges = useMemo(() => {
    if (!normalizedEdges || normalizedEdges.length === 0) return []
    const nodeIds = new Set(graphNodes.map((n) => n.id))
    return normalizedEdges
      .filter((edge) => {
        return (
          edge &&
          typeof edge === 'object' &&
          edge.id &&
          typeof edge.id === 'string' &&
          edge.source &&
          typeof edge.source === 'string' &&
          edge.target &&
          typeof edge.target === 'string' &&
          edge.data &&
          typeof edge.data === 'object' &&
          edge.data.type &&
          typeof edge.data.type === 'string' &&
          nodeIds.has(edge.source) &&
          nodeIds.has(edge.target)
        )
      })
      .map((edge) => {
        const edgeColor = EDGE_COLORS[edge.data.type] || '#6B7280'
        return {
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),
          color: edgeColor,
          type: edge.data.type,
          label: String(edge.label || ''),
          data: edge.data,
        }
      })
  }, [normalizedEdges, graphNodes])

  // Create graph data structure
  const graphData = useMemo(() => {
    return {
      nodes: graphNodes,
      links: graphEdges,
    }
  }, [graphNodes, graphEdges])

  const handleNodeClick = useCallback(
    (node: any) => {
      const originalNode = normalizedNodes.find((n) => n.id === node.id)
      if (originalNode) {
        setSelectedNode(originalNode)
      }
    },
    [normalizedNodes]
  )

  const handleNodeHover = useCallback(
    (node: any) => {
      if (node) {
        const originalNode = normalizedNodes.find((n) => n.id === node.id)
        if (originalNode) {
          setHoveredNode(originalNode)
        }
      } else {
        setHoveredNode(null)
      }
    },
    [normalizedNodes]
  )

  const getStageLabel = (stage: string) => {
    return stage
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return []
    return normalizedEdges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    )
  }, [selectedNode, normalizedEdges])

  const connectedPeople = useMemo(() => {
    if (!selectedNode) return []
    const connectedIds = new Set<string>()
    connectedEdges.forEach((edge) => {
      if (edge.source === selectedNode.id) connectedIds.add(edge.target)
      if (edge.target === selectedNode.id) connectedIds.add(edge.source)
    })
    return normalizedNodes.filter((n) => connectedIds.has(n.id))
  }, [selectedNode, connectedEdges, normalizedNodes])

  // Early return if no nodes
  if (!normalizedNodes || normalizedNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px] lg:h-[600px] text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No connections yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Add people and start logging interactions, attending events together,
          or tagging people with shared interests to see your relationship network.
        </p>
      </div>
    )
  }

  if (graphNodes.length === 0) {
    return null
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-lg border bg-slate-950 overflow-hidden">
      {/* Graph Canvas */}
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={(node: any) => node.name || node.id}
        nodeColor={(node: any) => node.color || STAGE_COLORS.NEW}
        linkColor={(link: any) => link.color || '#6B7280'}
        linkWidth={2}
        nodeRelSize={8}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        backgroundColor="#020617"
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        cooldownTicks={100}
        onEngineStop={() => {
          // Graph has finished positioning
        }}
      />

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-4 bg-background border rounded-lg p-3 shadow-lg max-w-xs pointer-events-none z-10"
          >
            <p className="font-medium text-foreground">{hoveredNode.data.name}</p>
            {hoveredNode.data.headline && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {hoveredNode.data.headline}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: STAGE_COLORS[hoveredNode.data.stage],
                  color: 'white',
                }}
              >
                {getStageLabel(hoveredNode.data.stage)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {hoveredNode.data.interactionCount} interactions
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Node Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 bottom-4 w-full md:w-80 bg-background border rounded-lg shadow-xl overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {selectedNode.data.name}
                  </h3>
                  {selectedNode.data.headline && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedNode.data.headline}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge
                  style={{
                    backgroundColor: STAGE_COLORS[selectedNode.data.stage],
                    color: 'white',
                  }}
                >
                  {getStageLabel(selectedNode.data.stage)}
                </Badge>
                {selectedNode.data.company && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {selectedNode.data.company}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-b grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Interactions</p>
                <p className="text-lg font-medium">
                  {selectedNode.data.interactionCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Contact</p>
                <p className="text-sm font-medium">
                  {formatDate(selectedNode.data.lastInteraction)}
                </p>
              </div>
            </div>

            {/* Tags */}
            {selectedNode.data.tags.length > 0 && (
              <div className="p-4 border-b">
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.data.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Connections */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-muted-foreground mb-2">
                Connections ({connectedPeople.length})
              </p>
              <div className="space-y-2">
                {connectedPeople.map((person) => {
                  const connectionEdge = connectedEdges.find(
                    (e) =>
                      (e.source === person.id && e.target === selectedNode.id) ||
                      (e.target === person.id && e.source === selectedNode.id)
                  )
                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        const node = normalizedNodes.find((n) => n.id === person.id)
                        if (node) setSelectedNode(node)
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium">{person.data.name}</p>
                        {connectionEdge && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {connectionEdge.data.type === 'event' && (
                              <Calendar className="h-3 w-3" />
                            )}
                            {connectionEdge.data.type === 'company' && (
                              <Building2 className="h-3 w-3" />
                            )}
                            {connectionEdge.data.type === 'tag' && (
                              <Tag className="h-3 w-3" />
                            )}
                            {connectionEdge.data.type === 'paper' && (
                              <BookOpen className="h-3 w-3" />
                            )}
                            {connectionEdge.data.context}
                          </p>
                        )}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: STAGE_COLORS[person.data.stage],
                        }}
                      />
                    </div>
                  )
                })}
                {connectedPeople.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No direct connections
                  </p>
                )}
              </div>
            </div>

            {/* View Profile Button */}
            <div className="p-4 border-t">
              <Button
                className="w-full"
                onClick={() => {
                  window.location.href = `/people/${selectedNode.id}`
                }}
              >
                View Full Profile
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-background/90 backdrop-blur border rounded-lg p-2 md:p-3 max-w-fit z-10">
        <p className="text-xs font-medium text-foreground mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <span className="text-xs text-muted-foreground">Stages:</span>
            {Object.entries(STAGE_COLORS).map(([stage, color]) => (
              <div key={stage} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground">
                  {stage.charAt(0) + stage.slice(1).toLowerCase().replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <span className="text-xs text-muted-foreground">Connections:</span>
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-4 h-0.5 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
