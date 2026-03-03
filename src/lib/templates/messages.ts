/**
 * Message Templates for AI Studio
 * Each template type has multiple variants for variety
 */

export const MESSAGE_TEMPLATES = {
  CONNECTION_FOLLOWUP: {
    name: 'Connection Follow-Up',
    description: 'First message after connecting on LinkedIn',
    targetWords: '60-90 words',
    variants: [
      `Hi {{person_name}},

Thanks for connecting! I came across your work on {{person_company_or_project}} and was impressed by {{specific_detail}}.

{{user_background}}

Would be great to hear about what you're working on. Let me know if you'd ever be open to a quick chat.

Best,
{{user_name}}`,

      `{{person_name}},

Appreciate you accepting my connection request. I've been following {{person_company_or_project}} and really admire {{specific_detail}}.

{{user_background}}

I'd love to learn more about your experience in {{person_area}}. Happy to share what I'm working on too if helpful.

Thanks,
{{user_name}}`,

      `Hey {{person_name}},

Great to connect! Your background in {{person_area}} caught my attention, especially {{specific_detail}}.

{{user_background}}

Would you be open to a brief conversation sometime? I think we could have an interesting exchange about {{shared_interest}}.

Cheers,
{{user_name}}`,
    ],
  },

  COFFEE_CHAT_REQUEST: {
    name: 'Coffee Chat Request',
    description: 'Request for an informational interview or coffee chat',
    targetWords: '80-120 words',
    variants: [
      `Hi {{person_name}},

I hope this message finds you well. I've been following your work at {{person_company}} and am particularly interested in {{specific_interest}}.

{{user_background}}

I'm currently exploring {{user_goal}} and would really value your perspective. Would you have 20-30 minutes for a virtual coffee sometime in the next few weeks?

I'm happy to work around your schedule. Also completely understand if you're swamped - no pressure at all.

Thanks for considering,
{{user_name}}`,

      `{{person_name}},

I came across your profile through {{discovery_context}} and was really impressed by your work on {{specific_project}}.

{{user_background}}

I'm trying to learn more about {{topic_of_interest}} and thought you'd be an excellent person to speak with. Would you be open to a 20-30 minute call?

I'm flexible on timing and happy to prepare specific questions in advance if that's helpful.

Best,
{{user_name}}`,

      `Hey {{person_name}},

I've been diving into {{topic_of_interest}} and your experience at {{person_company}} makes you someone I'd love to learn from.

{{user_background}}

Would you have time for a brief chat? I'm specifically curious about {{specific_question}} and think your insights would be invaluable.

Totally understand if your calendar is packed. Either way, thanks for all you share publicly - it's been helpful.

Cheers,
{{user_name}}`,
    ],
  },

  THANK_YOU: {
    name: 'Thank You',
    description: 'Follow-up thank you after a coffee chat',
    targetWords: '50-70 words',
    variants: [
      `Hi {{person_name}},

Thanks so much for taking the time to chat yesterday. Your perspective on {{discussion_topic}} was incredibly helpful, especially {{specific_insight}}.

I'm going to follow up on {{action_item}} and will keep you posted on how it goes.

Really appreciate your generosity with your time and insights.

Best,
{{user_name}}`,

      `{{person_name}},

Just wanted to say thank you for our conversation earlier. Your advice about {{specific_insight}} really resonated and I've already started {{action_item}}.

I'll definitely take you up on {{future_offer}} when the time comes. Thanks again for being so generous with your knowledge.

Cheers,
{{user_name}}`,

      `Hey {{person_name}},

Really grateful for your time today. The way you explained {{discussion_topic}} clarified a lot for me.

I'm planning to {{action_item}} based on our discussion. Will keep you updated on progress.

Thanks again,
{{user_name}}`,
    ],
  },

  TWO_WEEK_FOLLOWUP: {
    name: '2-4 Week Follow-Up',
    description: 'Check-in after initial conversation',
    targetWords: '70-90 words',
    variants: [
      `Hi {{person_name}},

Hope you're doing well! Wanted to give you a quick update on {{previous_topic}}.

Since we last spoke, I've {{progress_update}}. Your advice about {{specific_advice}} was spot on.

{{new_development}}

Would love to hear what you've been working on lately. Let me know if you're ever free for another chat.

Best,
{{user_name}}`,

      `{{person_name}},

Following up on our conversation from {{time_period}}. Just wanted to share that I {{progress_update}} and it's going well.

{{new_development}}

Thought you might find that interesting given our discussion about {{previous_topic}}. Hope things are good on your end.

Thanks,
{{user_name}}`,

      `Hey {{person_name}},

Quick update: I took your advice about {{specific_advice}} and {{progress_update}}. Really appreciate you pointing me in that direction.

{{new_development}}

Would be great to catch up again sometime if you're open to it. Either way, hope your work at {{person_company}} is going well.

Cheers,
{{user_name}}`,
    ],
  },

  VALUE_RECONNECT: {
    name: '2-3 Month Value Reconnect',
    description: 'Re-engage with value after time apart',
    targetWords: '80-100 words',
    variants: [
      `Hi {{person_name}},

It's been a while since we last connected. I've been thinking about our conversation on {{previous_topic}} and thought you might be interested in {{value_offering}}.

{{context_or_reason}}

Also wanted to share {{relevant_resource}} - it reminded me of your work on {{person_project}}.

Would love to hear what you've been up to. Let me know if you'd like to catch up sometime.

Best,
{{user_name}}`,

      `{{person_name}},

Hope this finds you well. I came across {{value_offering}} and immediately thought of you given your interest in {{person_interest}}.

{{context_or_reason}}

I've been working on {{user_update}} and would be curious to get your thoughts if you have time for a quick chat. No pressure though - I know you're busy.

Cheers,
{{user_name}}`,

      `Hey {{person_name}},

Been a few months since we talked, but I wanted to reach out because {{value_offering}}.

{{context_or_reason}}

I remember you mentioned {{previous_topic}} and thought this might be relevant. Would also love to hear how things are going at {{person_company}}.

Let me know if you're up for reconnecting.

Thanks,
{{user_name}}`,
    ],
  },
}

export type MessageTemplateType = keyof typeof MESSAGE_TEMPLATES

export function getTemplateTypes(): {
  value: MessageTemplateType
  label: string
  description: string
}[] {
  return Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => ({
    value: key as MessageTemplateType,
    label: template.name,
    description: template.description,
  }))
}

export function getTemplate(type: MessageTemplateType) {
  return MESSAGE_TEMPLATES[type]
}
