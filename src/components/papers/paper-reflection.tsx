'use client'

import { useState, useEffect } from 'react'
import { useUpdatePaperReflection } from '@/hooks/use-papers'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface PaperReflectionProps {
  paper: any
}

const REFLECTION_SECTIONS = [
  {
    key: 'whyRead',
    title: 'Why I Read This',
    prompt: 'What question or gap led me to this paper?',
  },
  {
    key: 'coreIdea',
    title: 'Core Idea (In My Own Words)',
    prompt: 'Explain the main idea as if to another ML engineer.',
  },
  {
    key: 'keyConcepts',
    title: 'Key Concepts / Equations',
    prompt: 'Important concepts or formulas worth remembering',
  },
  {
    key: 'implementationNotes',
    title: 'Implementation Notes',
    prompt: 'What parts are straightforward to implement? What\'s ambiguous? What assumptions matter?',
  },
  {
    key: 'surprises',
    title: 'What Surprised Me',
    prompt: 'What did I not expect before reading this?',
  },
  {
    key: 'thinkingShift',
    title: 'How This Changed My Thinking',
    prompt: 'How will this influence my future modeling or system design decisions?',
  },
  {
    key: 'followUps',
    title: 'Follow-Ups',
    prompt: 'Papers to read next, experiments to run, concepts to revisit',
  },
]

export function PaperReflection({ paper }: PaperReflectionProps) {
  const updateReflection = useUpdatePaperReflection(paper.id)
  const [reflections, setReflections] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Initialize reflections from paper data
  useEffect(() => {
    setReflections({
      whyRead: paper.whyRead || '',
      coreIdea: paper.coreIdea || '',
      keyConcepts: paper.keyConcepts || '',
      implementationNotes: paper.implementationNotes || '',
      surprises: paper.surprises || '',
      thinkingShift: paper.thinkingShift || '',
      followUps: paper.followUps || '',
    })
  }, [paper])

  const handleReflectionChange = (key: string, value: string) => {
    setReflections((prev) => ({ ...prev, [key]: value }))

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    setSaveStatus('saving')

    // Set new timeout for autosave (500ms debounce)
    const timeout = setTimeout(async () => {
      try {
        await updateReflection.mutateAsync({ [key]: value })
        setSaveStatus('saved')
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000)
      } catch (error) {
        setSaveStatus(null)
      }
    }, 500)

    setSaveTimeout(timeout)
  }

  // Get all section keys to expand them all by default
  const allSectionKeys = REFLECTION_SECTIONS.map((_, idx) => `item-${idx}`)

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">
            Structured Reflection
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Think deeply about this paper
          </p>
        </div>
        {saveStatus && (
          <span className="text-xs text-muted-foreground">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={allSectionKeys}
        className="w-full"
      >
        {REFLECTION_SECTIONS.map((section, index) => (
          <AccordionItem key={section.key} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              <span className="text-sm font-medium text-foreground">
                {section.title}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground italic">
                  {section.prompt}
                </p>
                <Textarea
                  placeholder={`Start writing your thoughts...`}
                  value={reflections[section.key] || ''}
                  onChange={(e) =>
                    handleReflectionChange(section.key, e.target.value)
                  }
                  className="min-h-[120px] resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="text-xs text-muted-foreground text-center pt-4">
        Your reflections autosave as you type
      </p>
    </div>
  )
}
