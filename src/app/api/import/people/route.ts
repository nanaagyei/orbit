import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RelationshipStage } from '@/generated/prisma'
import { requireSession } from '@/lib/auth-utils'

interface CSVPerson {
  name: string
  headline?: string
  company?: string
  location?: string
  linkedinUrl?: string
  stage?: string
  notes?: string
  tags?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have a header row and at least one data row' },
        { status: 400 }
      )
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
    const nameIndex = headers.indexOf('name')

    if (nameIndex === -1) {
      return NextResponse.json(
        { error: 'CSV must have a "name" column' },
        { status: 400 }
      )
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: Record<string, string> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      if (!row.name?.trim()) {
        results.skipped++
        continue
      }

      try {
        const personData: CSVPerson = {
          name: row.name.trim(),
          headline: row.headline?.trim() || undefined,
          company: row.company?.trim() || undefined,
          location: row.location?.trim() || undefined,
          linkedinUrl: row.linkedinurl?.trim() || row.linkedin?.trim() || undefined,
          stage: row.stage?.trim() || undefined,
          notes: row.notes?.trim() || undefined,
          tags: row.tags?.trim() || undefined,
        }

        const stage = validateStage(personData.stage)
        const tags = personData.tags
          ? personData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []

        await prisma.person.create({
          data: {
            name: personData.name,
            headline: personData.headline,
            company: personData.company,
            location: personData.location,
            linkedinUrl: personData.linkedinUrl,
            stage: stage,
            notes: personData.notes,
            tags: tags.length > 0
              ? {
                  create: tags.map((tagName) => ({
                    tag: {
                      connectOrCreate: {
                        where: { name: tagName },
                        create: { name: tagName },
                      },
                    },
                  })),
                }
              : undefined,
          },
        })

        results.imported++
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Import complete: ${results.imported} imported, ${results.skipped} skipped`,
      ...results,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error importing people:', error)
    return NextResponse.json({ error: 'Failed to import people' }, { status: 500 })
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function validateStage(stage?: string): RelationshipStage {
  if (!stage) return RelationshipStage.NEW

  const normalized = stage.toUpperCase().replace(/\s+/g, '_')
  const validStages: RelationshipStage[] = [
    RelationshipStage.NEW,
    RelationshipStage.CONNECTED,
    RelationshipStage.CHATTED,
    RelationshipStage.ONGOING,
    RelationshipStage.INNER_CIRCLE,
  ]

  const found = validStages.find((s) => s === normalized)
  return found || RelationshipStage.NEW
}
