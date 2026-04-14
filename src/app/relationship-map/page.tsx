'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Network, Filter, Users, GitBranch, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTags } from '@/hooks/use-tags'

import { RelationshipGraph } from '@/components/graph/relationship-graph'

interface GraphData {
  nodes: any[]
  edges: any[]
  stats: {
    totalPeople: number
    totalConnections: number
    connectionTypes: {
      event: number
      company: number
      tag: number
      paper: number
    }
  }
}

export default function RelationshipMapPage() {
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('365')

  const { data: tags } = useTags()

  const { data: graphData, isLoading } = useQuery<GraphData>({
    queryKey: ['graph', stageFilter, tagFilter, timeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (stageFilter !== 'all') params.set('stage', stageFilter)
      if (tagFilter !== 'all') params.set('tag', tagFilter)
      params.set('daysBack', timeFilter)

      const res = await fetch(`/api/graph?${params}`)
      if (!res.ok) throw new Error('Failed to fetch graph data')
      return res.json()
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-medium text-foreground flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            Relationship Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize your professional network and discover hidden connections
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 md:gap-4 p-4 border rounded-lg bg-muted/30"
      >
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Stage:</span>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONNECTED">Connected</SelectItem>
              <SelectItem value="CHATTED">Chatted</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="INNER_CIRCLE">Inner Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Tag:</span>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {tags?.map((tag: any) => (
                <SelectItem key={tag.id} value={tag.name}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Time:</span>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="9999">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(stageFilter !== 'all' || tagFilter !== 'all' || timeFilter !== '365') && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full md:w-auto"
            onClick={() => {
              setStageFilter('all')
              setTagFilter('all')
              setTimeFilter('365')
            }}
          >
            Clear Filters
          </Button>
        )}
      </motion.div>

      {/* Stats Bar */}
      {graphData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{graphData.stats.totalPeople}</span>{' '}
              <span className="text-muted-foreground">people</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{graphData.stats.totalConnections}</span>{' '}
              <span className="text-muted-foreground">connections</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {graphData.stats.connectionTypes.event > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                {graphData.stats.connectionTypes.event} events
              </Badge>
            )}
            {graphData.stats.connectionTypes.company > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                {graphData.stats.connectionTypes.company} companies
              </Badge>
            )}
            {graphData.stats.connectionTypes.tag > 0 && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                {graphData.stats.connectionTypes.tag} tags
              </Badge>
            )}
            {graphData.stats.connectionTypes.paper > 0 && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-500/30">
                {graphData.stats.connectionTypes.paper} papers
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px] md:h-[500px] lg:h-[600px] border rounded-lg bg-slate-950">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Building your relationship map...
              </p>
            </div>
          </div>
        ) : graphData ? (
          <RelationshipGraph 
            nodes={Array.isArray(graphData.nodes) ? graphData.nodes : []} 
            edges={Array.isArray(graphData.edges) ? graphData.edges : []} 
          />
        ) : null}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground border-t pt-4"
      >
        <p className="font-medium mb-2">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click and drag to pan around the graph</li>
          <li>Scroll to zoom in and out</li>
          <li>Click on a person to see their details and connections</li>
          <li>Use filters to focus on specific stages, tags, or time periods</li>
        </ul>
      </motion.div>
    </div>
  )
}
