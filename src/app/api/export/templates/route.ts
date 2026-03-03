import { NextRequest, NextResponse } from 'next/server'
import { MESSAGE_TEMPLATES } from '@/lib/templates/messages'
import { extractVariables } from '@/lib/templates/template-engine'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    await requireSession()
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'txt'

    if (format !== 'txt' && format !== 'md') {
      return NextResponse.json(
        { error: 'Invalid format. Use "txt" or "md"' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toISOString().split('T')[0]
    let content = ''
    let filename = ''
    let contentType = ''

    if (format === 'txt') {
      content = generatePlainTextTemplates()
      filename = `orbit-email-templates-${timestamp}.txt`
      contentType = 'text/plain; charset=utf-8'
    } else {
      content = generateMarkdownTemplates()
      filename = `orbit-email-templates-${timestamp}.md`
      contentType = 'text/markdown; charset=utf-8'
    }

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(content, { headers })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error exporting templates:', error)
    return NextResponse.json(
      { error: 'Failed to export templates' },
      { status: 500 }
    )
  }
}

function generatePlainTextTemplates(): string {
  const lines: string[] = []
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  lines.push('ORBIT EMAIL TEMPLATES')
  lines.push(`Exported: ${exportDate}`)
  lines.push('')
  lines.push('')

  Object.entries(MESSAGE_TEMPLATES).forEach(([key, template], index) => {
    if (index > 0) {
      lines.push('========================================')
      lines.push('')
    }

    // Template header
    lines.push(template.name.toUpperCase())
    lines.push(`Description: ${template.description}`)
    lines.push(`Target: ${template.targetWords}`)
    lines.push('')

    // Extract and list variables
    const allVariables = new Set<string>()
    template.variants.forEach((variant) => {
      const vars = extractVariables(variant)
      vars.forEach((v) => allVariables.add(v))
    })

    if (allVariables.size > 0) {
      lines.push('Variables:')
      Array.from(allVariables)
        .sort()
        .forEach((variable) => {
          lines.push(`- {{${variable}}}`)
        })
      lines.push('')
    }

    // Template variants
    template.variants.forEach((variant, variantIndex) => {
      lines.push(`Variant ${variantIndex + 1}:`)
      lines.push(variant)
      lines.push('')
    })
  })

  return lines.join('\n')
}

function generateMarkdownTemplates(): string {
  const lines: string[] = []
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  lines.push('# Orbit Email Templates')
  lines.push('')
  lines.push(`Exported: ${exportDate}`)
  lines.push('')
  lines.push('')

  Object.entries(MESSAGE_TEMPLATES).forEach(([key, template], index) => {
    if (index > 0) {
      lines.push('---')
      lines.push('')
    }

    // Template header
    const headerName = template.name.replace(/\s+/g, '-').toLowerCase()
    lines.push(`## ${template.name}`)
    lines.push('')
    lines.push(`**Description:** ${template.description}`)
    lines.push(`**Target:** ${template.targetWords}`)
    lines.push('')

    // Extract and list variables
    const allVariables = new Set<string>()
    template.variants.forEach((variant) => {
      const vars = extractVariables(variant)
      vars.forEach((v) => allVariables.add(v))
    })

    if (allVariables.size > 0) {
      lines.push('### Variables')
      lines.push('')
      Array.from(allVariables)
        .sort()
        .forEach((variable) => {
          lines.push(`- \`{{${variable}}}\``)
        })
      lines.push('')
    }

    // Template variants
    template.variants.forEach((variant, variantIndex) => {
      lines.push(`### Variant ${variantIndex + 1}`)
      lines.push('')
      lines.push('```')
      lines.push(variant)
      lines.push('```')
      lines.push('')
    })
  })

  return lines.join('\n')
}
