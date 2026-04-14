/**
 * Coffee Chat Question Templates
 * Thoughtful questions for informational interviews
 */

export const QUESTION_CATEGORIES = {
  CAREER_PATH: {
    name: 'Career Path & Decisions',
    questions: [
      'What were the key factors that led you to {{person_company}}?',
      'Looking back, what decision had the biggest impact on your career trajectory?',
      'How did you navigate the transition from {{previous_role}} to {{current_role}}?',
      'What skills have been most valuable as you progressed in your career?',
      'If you were starting your career today, what would you do differently?',
    ],
  },

  TECHNICAL_LEARNING: {
    name: 'Technical Learning & Growth',
    questions: [
      'How do you stay current with developments in {{technical_area}}?',
      'What resources or learning methods have been most effective for you?',
      'How do you balance depth versus breadth when learning new technologies?',
      'What technical skill took you longest to develop but has been most valuable?',
      'How do you approach learning something completely outside your expertise?',
    ],
  },

  INDUSTRY_INSIGHTS: {
    name: 'Industry & Domain Insights',
    questions: [
      'What trends in {{industry}} are you most excited or concerned about?',
      'How has {{industry}} changed since you started working in it?',
      'What common misconceptions do people have about {{domain}}?',
      'Where do you see the biggest opportunities in {{field}} right now?',
      'What problems in {{industry}} deserve more attention than they get?',
    ],
  },

  WORK_APPROACH: {
    name: 'Work Approach & Methodology',
    questions: [
      'How do you approach {{type_of_work}} differently now than when you started?',
      'What does your typical week look like in terms of deep work versus meetings?',
      'How do you decide what to work on when you have multiple interesting options?',
      'What systems or habits help you stay productive?',
      'How do you balance exploration of new ideas with execution on current projects?',
    ],
  },

  COMPANY_CULTURE: {
    name: 'Company & Team Dynamics',
    questions: [
      'What makes {{person_company}} a good fit for the work you want to do?',
      'How does your team approach {{specific_challenge}}?',
      'What surprised you most about working at {{person_company}}?',
      'How do you evaluate whether a team or company is right for you?',
      'What aspects of your team culture contribute most to your productivity?',
    ],
  },

  SPECIFIC_PROJECT: {
    name: 'Specific Project Deep Dive',
    questions: [
      'What was the hardest part of working on {{project_name}}?',
      'How did you approach {{technical_challenge}} in {{project_name}}?',
      'What would you do differently if you were starting {{project_name}} today?',
      'What trade-offs did you make in {{project_name}} and how do you think about them now?',
      'What did you learn from {{project_name}} that changed how you approach new work?',
    ],
  },

  ADVICE_SEEKING: {
    name: 'Advice & Guidance',
    questions: [
      'What advice would you give someone trying to break into {{field}}?',
      'How would you recommend approaching {{specific_challenge}}?',
      'What should someone prioritize when {{career_stage}}?',
      'What red flags should I watch for when {{decision_context}}?',
      'What do you wish someone had told you about {{topic}}?',
    ],
  },
}

export type QuestionCategory = keyof typeof QUESTION_CATEGORIES

export function getCategoryQuestions(category: QuestionCategory): string[] {
  return QUESTION_CATEGORIES[category].questions
}

export function getAllCategories(): {
  value: QuestionCategory
  label: string
}[] {
  return Object.entries(QUESTION_CATEGORIES).map(([key, category]) => ({
    value: key as QuestionCategory,
    label: category.name,
  }))
}

/**
 * Get recommended questions based on person context
 */
export function getRecommendedQuestions(context: {
  hasCompany?: boolean
  hasProject?: boolean
  hasIndustry?: boolean
  careerStage?: string
}): QuestionCategory[] {
  const recommendations: QuestionCategory[] = ['CAREER_PATH', 'ADVICE_SEEKING']

  if (context.hasCompany) {
    recommendations.push('COMPANY_CULTURE')
  }

  if (context.hasProject) {
    recommendations.push('SPECIFIC_PROJECT')
  }

  if (context.hasIndustry) {
    recommendations.push('INDUSTRY_INSIGHTS')
  }

  return recommendations
}

/**
 * Select N random questions from a category
 */
export function selectRandomQuestions(
  category: QuestionCategory,
  count: number = 3
): string[] {
  const questions = getCategoryQuestions(category)
  const selected: string[] = []
  const available = [...questions]

  while (selected.length < count && available.length > 0) {
    const index = Math.floor(Math.random() * available.length)
    selected.push(available[index])
    available.splice(index, 1)
  }

  return selected
}
