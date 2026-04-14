'use client'

import { useState, useEffect } from 'react'
import { Copy, Minimize2, RotateCw } from 'lucide-react'
import { usePeople } from '@/hooks/use-people'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  getTemplateTypes,
  getTemplate,
  type MessageTemplateType,
} from '@/lib/templates/messages'
import {
  processTemplate,
  extractVariables,
  selectRandomVariant,
  type TemplateVariables,
} from '@/lib/templates/template-engine'
import {
  shortenMessage,
  getShorteningStats,
} from '@/lib/templates/shorten'
import {
  getAllCategories,
  selectRandomQuestions,
  type QuestionCategory,
} from '@/lib/templates/questions'

type Mode = 'messages' | 'questions'

export default function AIStudioPage() {
  const [mode, setMode] = useState<Mode>('messages')
  const [templateType, setTemplateType] = useState<MessageTemplateType | ''>('')
  const [questionCategory, setQuestionCategory] = useState<QuestionCategory | ''>('')
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [variables, setVariables] = useState<TemplateVariables>({})
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [variantIndex, setVariantIndex] = useState(0)

  const { data: people } = usePeople({})
  const templateTypes = getTemplateTypes()
  const questionCategories = getAllCategories()

  // Auto-populate variables when person is selected
  useEffect(() => {
    if (selectedPersonId && selectedPersonId !== '__none__' && people) {
      const person = people.find((p: any) => p.id === selectedPersonId)
      if (person) {
        setVariables((prev) => ({
          ...prev,
          person_name: person.name,
          person_company: person.company || '',
          person_area: person.headline || '',
          person_company_or_project: person.company || person.headline || '',
          person_interest: person.headline || '',
          person_project: person.company || '',
        }))
      }
    }
  }, [selectedPersonId, people])

  const handleGenerate = () => {
    if (mode === 'messages') {
      if (!templateType) {
        toast.error('Please select a template type')
        return
      }

      const template = getTemplate(templateType as MessageTemplateType)
      const variant = template.variants[variantIndex]
      const processed = processTemplate(variant, variables)

      setGeneratedMessage(processed)
      toast.success('Message generated')
    } else {
      if (!questionCategory) {
        toast.error('Please select a question category')
        return
      }

      const questions = selectRandomQuestions(questionCategory as QuestionCategory, 3)
      const processed = questions
        .map((q, i) => {
          const filled = processTemplate(q, variables)
          return `${i + 1}. ${filled}`
        })
        .join('\n\n')

      setGeneratedMessage(processed)
      toast.success('Questions generated')
    }
  }

  const handleNextVariant = () => {
    if (mode === 'messages' && templateType) {
      const template = getTemplate(templateType as MessageTemplateType)
      const nextIndex = (variantIndex + 1) % template.variants.length
      setVariantIndex(nextIndex)

      const variant = template.variants[nextIndex]
      const processed = processTemplate(variant, variables)
      setGeneratedMessage(processed)

      toast.success(`Variant ${nextIndex + 1} of ${template.variants.length}`)
    }
  }

  const handleShorten = () => {
    if (!generatedMessage) {
      toast.error('Generate a message first')
      return
    }

    const shortened = shortenMessage(generatedMessage)
    const stats = getShorteningStats(generatedMessage, shortened)

    setGeneratedMessage(shortened)
    toast.success(`Reduced by ${stats.charReductionPercent}% (${stats.wordReduction} words)`)
  }

  const handleCopy = () => {
    if (!generatedMessage) {
      toast.error('Generate a message first')
      return
    }

    navigator.clipboard.writeText(generatedMessage)
    toast.success('Copied to clipboard')
  }

  const getRequiredVariables = (): string[] => {
    if (mode === 'messages' && templateType) {
      const template = getTemplate(templateType as MessageTemplateType)
      return extractVariables(template.variants[0])
    }
    if (mode === 'questions' && questionCategory) {
      return ['person_name', 'person_company', 'person_area']
    }
    return []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground">AI Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate personalized messages and coffee chat questions
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'messages' ? 'default' : 'outline'}
          onClick={() => setMode('messages')}
        >
          Messages
        </Button>
        <Button
          variant={mode === 'questions' ? 'default' : 'outline'}
          onClick={() => setMode('questions')}
        >
          Coffee Chat Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6 border rounded-lg p-6">
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">
              {mode === 'messages' ? 'Message Generator' : 'Question Generator'}
            </h2>

            <div className="space-y-4">
              {/* Template/Category Selector */}
              {mode === 'messages' ? (
                <div className="space-y-2">
                  <Label>Template Type</Label>
                  <Select
                    value={templateType}
                    onValueChange={(value) => {
                      setTemplateType(value as MessageTemplateType)
                      setVariantIndex(0)
                      setGeneratedMessage('')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Question Category</Label>
                  <Select
                    value={questionCategory}
                    onValueChange={(value) => {
                      setQuestionCategory(value as QuestionCategory)
                      setGeneratedMessage('')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question category" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Person Selector */}
              <div className="space-y-2">
                <Label>Person (Optional - auto-fills variables)</Label>
                <Select value={selectedPersonId || '__none__'} onValueChange={(value) => {
                  setSelectedPersonId(value === '__none__' ? '' : value)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {people?.map((person: any) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                        {person.company && ` • ${person.company}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Variable Inputs */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Variables</Label>
                <p className="text-xs text-muted-foreground">
                  Customize the placeholders below to personalize your message
                </p>

                {getRequiredVariables().map((variable) => (
                  <div key={variable} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {variable.replace(/_/g, ' ')}
                    </Label>
                    <Input
                      placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                      value={variables[variable] || ''}
                      onChange={(e) =>
                        setVariables((prev) => ({
                          ...prev,
                          [variable]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}

                {getRequiredVariables().length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select a template or category to see variables
                  </p>
                )}
              </div>

              <Separator />

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                className="w-full"
                disabled={
                  mode === 'messages'
                    ? !templateType
                    : !questionCategory
                }
              >
                Generate {mode === 'messages' ? 'Message' : 'Questions'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-4 border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">
              Generated Output
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {mode === 'messages' && templateType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextVariant}
                  disabled={!generatedMessage}
                  className="flex-1 md:flex-initial"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Next Variant</span>
                  <span className="sm:hidden">Variant</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShorten}
                disabled={!generatedMessage}
                className="flex-1 md:flex-initial"
              >
                <Minimize2 className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">Shorten</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!generatedMessage}
                className="flex-1 md:flex-initial"
              >
                <Copy className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="Your generated message will appear here..."
            value={generatedMessage}
            onChange={(e) => setGeneratedMessage(e.target.value)}
            className="min-h-[300px] md:min-h-[400px] font-mono text-sm"
          />

          {generatedMessage && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Badge variant="outline">
                {generatedMessage.length} characters
              </Badge>
              <Badge variant="outline">
                {generatedMessage.trim().split(/\s+/).length} words
              </Badge>
              {mode === 'messages' && templateType && (
                <Badge variant="outline">
                  Variant {variantIndex + 1} of {getTemplate(templateType as MessageTemplateType).variants.length}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
