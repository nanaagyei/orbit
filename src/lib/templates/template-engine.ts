/**
 * Template Engine for AI Studio
 * Handles variable substitution and message generation
 */

export interface TemplateVariables {
  [key: string]: string | undefined
}

export interface Template {
  id: string
  name: string
  content: string
  variables: string[] // List of required variables like {{person_name}}, {{user_background}}
}

/**
 * Extracts variables from a template string
 * @param template - Template string with {{variable}} placeholders
 * @returns Array of variable names
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

/**
 * Replaces variables in a template with provided values
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns Processed template with variables replaced
 */
export function processTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let processed = template

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    processed = processed.replace(regex, value || '')
  })

  // Clean up any remaining unreplaced variables
  processed = processed.replace(/\{\{\w+\}\}/g, '[missing]')

  return processed.trim()
}

/**
 * Validates that all required variables are provided
 * @param template - Template string
 * @param variables - Provided variables
 * @returns Object with isValid flag and missing variables array
 */
export function validateVariables(
  template: string,
  variables: TemplateVariables
): { isValid: boolean; missing: string[] } {
  const required = extractVariables(template)
  const missing = required.filter((key) => !variables[key])

  return {
    isValid: missing.length === 0,
    missing,
  }
}

/**
 * Selects a random variant from an array of templates
 * @param variants - Array of template strings
 * @returns Randomly selected template
 */
export function selectRandomVariant(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)]
}

/**
 * Counts words in a string
 * @param text - Text to count
 * @returns Number of words
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length
}

/**
 * Estimates character count for a template after variable substitution
 * @param template - Template string
 * @param variables - Variable values
 * @returns Estimated character count
 */
export function estimateLength(
  template: string,
  variables: TemplateVariables
): number {
  return processTemplate(template, variables).length
}
