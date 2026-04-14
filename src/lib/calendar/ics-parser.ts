import * as ical from 'node-ical'

export interface ParsedICSEvent {
  title: string
  start: Date
  end?: Date
  location?: string
  description?: string
  url?: string
}

export interface ICSImportResult {
  success: boolean
  created: number
  skipped: number
  errors: string[]
  events: ParsedICSEvent[]
}

export async function parseICSFile(file: File): Promise<ICSImportResult> {
  const result: ICSImportResult = {
    success: true,
    created: 0,
    skipped: 0,
    errors: [],
    events: [],
  }

  try {
    const text = await file.text()
    const parsed = ical.sync.parseICS(text)

    if (!parsed || Object.keys(parsed).length === 0) {
      result.errors.push('No events found in ICS file')
      return result
    }

    for (const key in parsed) {
      const component = parsed[key]
      
      // Only process VEVENT components
      if (component.type !== 'VEVENT') {
        continue
      }

      try {
        if (!component.start || !component.summary) {
          result.skipped++
          result.errors.push('Skipped event: missing required fields (summary or start date)')
          continue
        }

        const startDate = component.start instanceof Date 
          ? component.start 
          : new Date(component.start)

        let endDate: Date | undefined
        if (component.end) {
          endDate = component.end instanceof Date 
            ? component.end 
            : new Date(component.end)
        } else if (component.duration) {
          // Calculate end date from duration
          const durationMs = component.duration.toSeconds() * 1000
          endDate = new Date(startDate.getTime() + durationMs)
        } else {
          // Default to 1 hour if no end time
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000)
        }

        const parsedEvent: ParsedICSEvent = {
          title: String(component.summary || 'Untitled Event'),
          start: startDate,
          end: endDate,
          location: component.location ? String(component.location) : undefined,
          description: component.description ? String(component.description) : undefined,
          url: component.url ? String(component.url) : undefined,
        }

        result.events.push(parsedEvent)
        result.created++
      } catch (error) {
        result.skipped++
        result.errors.push(
          `Failed to parse event: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(
      `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  return result
}
