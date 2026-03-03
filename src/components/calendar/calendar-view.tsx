'use client'

import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CalendarEventCard } from './calendar-event-card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Grid3x3, List, Calendar as CalendarIcon } from 'lucide-react'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarViewProps {
  events: Array<{
    id: string
    title: string
    start: Date
    end: Date
    type: 'event' | 'followup' | 'interaction'
    resource?: any
  }>
  onSelectEvent?: (event: any) => void
  onNavigate?: (date: Date) => void
}

export function CalendarView({ events, onSelectEvent, onNavigate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
    onNavigate?.(newDate)
  }

  const eventStyleGetter = (event: Event) => {
    const type = (event.resource as any)?.type || 'event'
    let backgroundColor = '#3B82F6'
    let borderColor = '#2563EB'

    switch (type) {
      case 'event':
        backgroundColor = '#3B82F6'
        borderColor = '#2563EB'
        break
      case 'followup':
        backgroundColor = '#F59E0B'
        borderColor = '#D97706'
        break
      case 'interaction':
        backgroundColor = '#10B981'
        borderColor = '#059669'
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderRadius: '4px',
        color: 'white',
        padding: '2px 4px',
      },
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate(new Date())}
          >
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const prevDate = new Date(currentDate)
                if (view === 'month') {
                  prevDate.setMonth(prevDate.getMonth() - 1)
                } else if (view === 'week') {
                  prevDate.setDate(prevDate.getDate() - 7)
                } else {
                  prevDate.setDate(prevDate.getDate() - 1)
                }
                handleNavigate(prevDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const nextDate = new Date(currentDate)
                if (view === 'month') {
                  nextDate.setMonth(nextDate.getMonth() + 1)
                } else if (view === 'week') {
                  nextDate.setDate(nextDate.getDate() + 7)
                } else {
                  nextDate.setDate(nextDate.getDate() + 1)
                }
                handleNavigate(nextDate)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy', { locale: enUS })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
            className="flex-1 md:flex-initial"
          >
            <Grid3x3 className="h-4 w-4 md:mr-2" />
            <span className="hidden sm:inline">Month</span>
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
            className="flex-1 md:flex-initial"
          >
            <CalendarIcon className="h-4 w-4 md:mr-2" />
            <span className="hidden sm:inline">Week</span>
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
            className="flex-1 md:flex-initial"
          >
            <List className="h-4 w-4 md:mr-2" />
            <span className="hidden sm:inline">Day</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={onSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-4 pt-4 border-t">
        <span className="text-sm text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs">Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs">Follow-Ups</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs">Interactions</span>
        </div>
      </div>
    </div>
  )
}
