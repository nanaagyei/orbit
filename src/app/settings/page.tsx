'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Trash2, Download, Upload, FileJson, FileSpreadsheet, Check, Loader2, Calendar, FileText } from 'lucide-react'
import { useTags, useDeleteTag } from '@/hooks/use-tags'
import { usePositioning, useCreatePositioning, useUpdatePositioning } from '@/hooks/use-positioning'
import { useDebounce } from '@/hooks/use-debounce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CalendarSyncSection } from '@/components/settings/calendar-sync-section'

export default function SettingsPage() {
  const { data: tags, isLoading } = useTags()
  const deleteTag = useDeleteTag()

  const handleDeleteTag = async (tagId: string, tagName: string, usageCount: number) => {
    if (usageCount > 0) {
      if (
        !confirm(
          `This tag is used ${usageCount} time${
            usageCount > 1 ? 's' : ''
          }. Deleting it will remove it from all people and papers. Are you sure?`
        )
      ) {
        return
      }
    } else {
      if (!confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
        return
      }
    }

    try {
      await deleteTag.mutateAsync(tagId)
      toast.success('Tag deleted successfully')
    } catch (error) {
      toast.error('Failed to delete tag')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure positioning, import/export, and manage tags
        </p>
      </div>

      <Separator />

      {/* Tags Management */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Tags</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tags used across people and papers
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading tags...</p>
          </div>
        ) : tags && tags.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Name</TableHead>
                  <TableHead>Used in People</TableHead>
                  <TableHead>Used in Papers</TableHead>
                  <TableHead>Total Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag: any) => {
                  const totalUsage = tag._count.people + tag._count.papers

                  return (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge variant="outline">{tag.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tag._count.people}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {tag._count.papers}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {totalUsage}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteTag(tag.id, tag.name, totalUsage)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tags yet. Tags will appear here as you add them to people and
              papers.
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Positioning Section */}
      <PositioningSection />

      <Separator />

      {/* Calendar Sync Section */}
      <CalendarSyncSection />

      <Separator />

      {/* Import/Export Section */}
      <ImportExportSection />

      <Separator />

      {/* About Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">About</h2>
        </div>
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">App Version</span>
            <span className="font-medium">0.1.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium">PostgreSQL (Docker)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const POSITIONING_TYPES = [
  {
    type: 'primary',
    label: 'Primary Positioning',
    description: 'Your main professional identity and what you want to be known for',
    placeholder: 'e.g., "ML engineer specializing in recommendation systems, focused on building personalized experiences at scale..."',
  },
  {
    type: 'north_star',
    label: 'North Star Goal',
    description: 'Your long-term career aspiration that guides your decisions',
    placeholder: 'e.g., "Become a technical leader in ML infrastructure, building systems that democratize access to ML for product teams..."',
  },
  {
    type: 'niche',
    label: 'Active Niches',
    description: 'Specific areas you are actively building expertise in',
    placeholder: 'e.g., "Real-time ML serving, feature stores, MLOps best practices, transformer architectures for recommendations..."',
  },
  {
    type: 'project',
    label: 'Current Projects & Learning',
    description: 'What you are actively working on and learning right now',
    placeholder: 'e.g., "Building a side project using RAG for code documentation, reading papers on efficient attention mechanisms..."',
  },
]

interface PositioningItemProps {
  type: string
  label: string
  description: string
  placeholder: string
  existingData?: { id: string; content: string } | null
}

function PositioningItem({ type, label, description, placeholder, existingData }: PositioningItemProps) {
  const [content, setContent] = useState(existingData?.content || '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const debouncedContent = useDebounce(content, 500)
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: { type: string; content: string }) => {
      const res = await fetch('/api/positioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create positioning')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positioning'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/positioning/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed to update positioning')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positioning'] })
    },
  })

  // Autosave effect
  useEffect(() => {
    if (debouncedContent === (existingData?.content || '')) {
      return
    }

    if (!debouncedContent.trim()) {
      return
    }

    setSaveStatus('saving')

    const save = async () => {
      try {
        if (existingData?.id) {
          await updateMutation.mutateAsync({ id: existingData.id, content: debouncedContent })
        } else {
          await createMutation.mutateAsync({ type, content: debouncedContent })
        }
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        setSaveStatus('idle')
        toast.error('Failed to save')
      }
    }

    save()
  }, [debouncedContent, existingData?.id, existingData?.content, type])

  // Sync with external data changes
  useEffect(() => {
    if (existingData?.content && existingData.content !== content) {
      setContent(existingData.content)
    }
  }, [existingData?.content])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Saved</span>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-y"
      />
    </div>
  )
}

function PositioningSection() {
  const { data: allPositioning, isLoading } = usePositioning()

  const positioningByType = useMemo(() => {
    if (!allPositioning) return {}
    return allPositioning.reduce((acc: Record<string, any>, item: any) => {
      // Keep only the most recent active item per type
      if (!acc[item.type] || new Date(item.updatedAt) > new Date(acc[item.type].updatedAt)) {
        acc[item.type] = item
      }
      return acc
    }, {})
  }, [allPositioning])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Positioning & Narrative</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define your professional positioning for AI-generated messages. Changes are saved automatically.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg p-6 space-y-6">
          {POSITIONING_TYPES.map((item) => (
            <PositioningItem
              key={item.type}
              type={item.type}
              label={item.label}
              description={item.description}
              placeholder={item.placeholder}
              existingData={positioningByType[item.type] || null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ImportExportSection() {
  const [csvEntity, setCsvEntity] = useState('people')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isImportingICS, setIsImportingICS] = useState(false)
  const [templateFormat, setTemplateFormat] = useState<'txt' | 'md'>('txt')
  const [isExportingTemplates, setIsExportingTemplates] = useState(false)
  const [icsImportResult, setIcsImportResult] = useState<{
    created: number
    skipped: number
    errors?: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const icsFileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orbit-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Full backup exported successfully')
    } catch (error) {
      toast.error('Failed to export backup')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/export?format=csv&entity=${csvEntity}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orbit-${csvEntity}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`${csvEntity} exported as CSV`)
    } catch (error) {
      toast.error('Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportTemplates = async () => {
    setIsExportingTemplates(true)
    try {
      const response = await fetch(`/api/export/templates?format=${templateFormat}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const extension = templateFormat === 'md' ? 'md' : 'txt'
      a.download = `orbit-email-templates-${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Email templates exported as ${templateFormat.toUpperCase()}`)
    } catch (error) {
      toast.error('Failed to export templates')
    } finally {
      setIsExportingTemplates(false)
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/people', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      toast.success(result.message)

      if (result.errors?.length > 0) {
        console.warn('Import errors:', result.errors)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import CSV')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportICS = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImportingICS(true)
    setIcsImportResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/calendar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setIcsImportResult({
        created: result.created,
        skipped: result.skipped,
        errors: result.errors,
      })

      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success(result.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import calendar file')
    } finally {
      setIsImportingICS(false)
      if (icsFileInputRef.current) {
        icsFileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Import / Export</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Backup and restore your data
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Export Data</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Full JSON Backup */}
            <div className="flex-1 border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Full Backup (JSON)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all data including people, interactions, papers, events,
                and follow-ups.
              </p>
              <Button
                onClick={handleExportJSON}
                disabled={isExporting}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Download Backup'}
              </Button>
            </div>

            {/* CSV Export */}
            <div className="flex-1 border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Export as CSV</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export a specific entity as a CSV file for use in spreadsheets.
              </p>
              <div className="flex gap-2">
                <Select value={csvEntity} onValueChange={setCsvEntity}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="people">People</SelectItem>
                    <SelectItem value="papers">Papers</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="interactions">Interactions</SelectItem>
                    <SelectItem value="followups">Follow-ups</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Email Templates Export */}
            <div className="flex-1 border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Email Templates</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export email message templates as plain text or Markdown for reuse outside the app.
              </p>
              <div className="flex gap-2">
                <Select value={templateFormat} onValueChange={(value: 'txt' | 'md') => setTemplateFormat(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">Plain Text</SelectItem>
                    <SelectItem value="md">Markdown</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExportTemplates}
                  disabled={isExportingTemplates}
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Import Data</h3>

          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Import People (CSV)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Import people from a CSV file. Required column: name. Optional
              columns: headline, company, location, linkedinUrl, stage, notes,
              tags (comma-separated).
            </p>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
                id="csv-import"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Select CSV File'}
              </Button>
            </div>
          </div>

          {/* ICS Calendar Import */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Import Calendar (.ics)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Import events from a calendar file (.ics format). Supports Google Calendar, Apple Calendar, Outlook, and other standard calendar formats.
            </p>
            <div>
              <input
                ref={icsFileInputRef}
                type="file"
                accept=".ics"
                onChange={handleImportICS}
                className="hidden"
                id="ics-import"
              />
              <Button
                onClick={() => icsFileInputRef.current?.click()}
                disabled={isImportingICS}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImportingICS ? 'Importing...' : 'Select .ics File'}
              </Button>
            </div>
            {icsImportResult && (
              <div className="mt-3 p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm font-medium">
                  Import complete: {icsImportResult.created} event{icsImportResult.created !== 1 ? 's' : ''} created
                </p>
                {icsImportResult.skipped > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {icsImportResult.skipped} duplicate{icsImportResult.skipped !== 1 ? 's' : ''} skipped
                  </p>
                )}
                {icsImportResult.errors && icsImportResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-destructive">Errors:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {icsImportResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {icsImportResult.errors.length > 5 && (
                        <li>...and {icsImportResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
