/**
 * Message Shortening Algorithm
 * Reduces message length by 20-30% by removing filler words and redundant phrases
 */

// Filler words and phrases that can be safely removed
const FILLER_WORDS = [
  'just',
  'really',
  'very',
  'quite',
  'actually',
  'basically',
  'literally',
  'honestly',
  'definitely',
  'absolutely',
  'certainly',
  'probably',
  'perhaps',
  'maybe',
  'kind of',
  'sort of',
  'a bit',
  'a little',
  'somehow',
  'somewhat',
]

// Common wordy phrases and their shorter equivalents
const WORDY_PHRASES: { [key: string]: string } = {
  'in order to': 'to',
  'due to the fact that': 'because',
  'at this point in time': 'now',
  'in the event that': 'if',
  'for the purpose of': 'for',
  'in spite of the fact that': 'although',
  'on account of': 'because',
  'with regard to': 'about',
  'with respect to': 'about',
  'in light of the fact that': 'because',
  'by means of': 'by',
  'for the reason that': 'because',
  'in view of the fact that': 'because',
  'it is important to note that': '',
  'it should be noted that': '',
  'it is worth mentioning that': '',
  'I wanted to reach out': 'I wanted',
  'I just wanted to say': '',
  'I hope this email finds you well': '',
  'I hope this message finds you well': '',
  'completely understand if': 'understand if',
  'totally understand if': 'understand if',
  'would really appreciate': 'would appreciate',
  'would be great': 'great',
  'would love to': 'love to',
}

// Redundant closings and opening phrases
const REDUNDANT_PHRASES = [
  'Thanks so much for',
  'Thank you so much for',
  'I really appreciate',
  'I greatly appreciate',
  'either way,',
  'in any case,',
  'at any rate,',
]

/**
 * Removes filler words from text
 */
function removeFiller(text: string): string {
  let shortened = text

  FILLER_WORDS.forEach((word) => {
    // Match filler words with word boundaries, case-insensitive
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    shortened = shortened.replace(regex, '')
  })

  // Clean up extra spaces
  shortened = shortened.replace(/\s{2,}/g, ' ')

  return shortened
}

/**
 * Replaces wordy phrases with shorter equivalents
 */
function replaceWordyPhrases(text: string): string {
  let shortened = text

  Object.entries(WORDY_PHRASES).forEach(([wordy, concise]) => {
    const regex = new RegExp(wordy, 'gi')
    shortened = shortened.replace(regex, concise)
  })

  return shortened
}

/**
 * Removes redundant phrases
 */
function removeRedundantPhrases(text: string): string {
  let shortened = text

  REDUNDANT_PHRASES.forEach((phrase) => {
    const regex = new RegExp(phrase, 'gi')
    shortened = shortened.replace(regex, '')
  })

  return shortened
}

/**
 * Condenses consecutive sentences starting with "I"
 */
function condenseIPhrases(text: string): string {
  // Replace patterns like "I would love to. I am" with "I'd love to and am"
  let shortened = text.replace(/\.\s+I\s+am\s+/g, " and I'm ")
  shortened = shortened.replace(/\.\s+I\s+would\s+/g, " and I'd ")
  shortened = shortened.replace(/\.\s+I\s+will\s+/g, " and I'll ")
  shortened = shortened.replace(/\.\s+I\s+have\s+/g, " and I've ")

  return shortened
}

/**
 * Removes extra line breaks
 */
function condenseLineBreaks(text: string): string {
  // Replace 3+ line breaks with 2
  return text.replace(/\n{3,}/g, '\n\n')
}

/**
 * Main shorten function
 * Applies multiple shortening techniques to reduce message length
 * Target: 20-30% reduction
 */
export function shortenMessage(text: string): string {
  let shortened = text

  // Apply all shortening techniques
  shortened = replaceWordyPhrases(shortened)
  shortened = removeFiller(shortened)
  shortened = removeRedundantPhrases(shortened)
  shortened = condenseIPhrases(shortened)
  shortened = condenseLineBreaks(shortened)

  // Clean up spacing issues
  shortened = shortened.replace(/\s+([,.])/g, '$1') // Remove space before punctuation
  shortened = shortened.replace(/\s{2,}/g, ' ') // Remove double spaces
  shortened = shortened.replace(/\n\s+/g, '\n') // Remove spaces after line breaks
  shortened = shortened.trim()

  return shortened
}

/**
 * Calculates reduction percentage
 */
export function calculateReduction(original: string, shortened: string): number {
  const originalLength = original.length
  const shortenedLength = shortened.length
  const reduction = ((originalLength - shortenedLength) / originalLength) * 100

  return Math.round(reduction)
}

/**
 * Get statistics about the shortening
 */
export function getShorteningStats(original: string, shortened: string) {
  const originalWords = original.trim().split(/\s+/).length
  const shortenedWords = shortened.trim().split(/\s+/).length
  const wordReduction = originalWords - shortenedWords

  return {
    originalLength: original.length,
    shortenedLength: shortened.length,
    charReduction: original.length - shortened.length,
    charReductionPercent: calculateReduction(original, shortened),
    originalWords,
    shortenedWords,
    wordReduction,
  }
}
