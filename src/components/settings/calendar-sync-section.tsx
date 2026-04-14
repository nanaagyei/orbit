'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function CalendarSyncSection() {
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)

  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['calendar-sync'],
    queryFn: async () => {
      const res = await fetch('/api/calendar/google/sync')
      if (!res.ok) throw new Error('Failed to fetch sync status')
      return res.json()
    },
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/calendar/google/sync', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to sync')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success(data.message || 'Calendar synced successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to sync calendar')
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/calendar/google/disconnect', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to disconnect')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync'] })
      toast.success('Google Calendar disconnected')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to disconnect')
    },
  })

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch('/api/calendar/google/auth')
      if (!res.ok) throw new Error('Failed to get auth URL')
      const { authUrl } = await res.json()
      window.location.href = authUrl
    } catch (error) {
      toast.error('Failed to connect Google Calendar')
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isConnected = syncStatus?.connected === true

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Calendar Sync</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sync events from Google Calendar into Orbit
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Google Calendar</p>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Calendar to automatically import events
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: You'll need to configure Google OAuth credentials in your environment variables.
              See the documentation for setup instructions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Google Calendar Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Calendar ID: {syncStatus.calendarId || 'primary'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                Connected
              </Badge>
            </div>

            {syncStatus.lastSyncAt && (
              <div className="text-sm text-muted-foreground">
                Last synced: {format(new Date(syncStatus.lastSyncAt), 'PPp')}
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-2">
              <Button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                variant="outline"
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  if (confirm('Are you sure you want to disconnect Google Calendar?')) {
                    disconnectMutation.mutate()
                  }
                }}
                disabled={disconnectMutation.isPending}
                variant="outline"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Syncing will import events from the last 30 days and next 90 days. Orbit remains your source of truth for event details and notes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
