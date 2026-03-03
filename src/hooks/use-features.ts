'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ALL_FEATURE_IDS,
  type FeatureId,
} from '@/lib/features/registry'

export function useFeatures() {
  const { data, isLoading } = useQuery({
    queryKey: ['features'],
    queryFn: async () => {
      const res = await fetch('/api/features')
      if (!res.ok) throw new Error('Failed to fetch features')
      const json = await res.json()
      return json.featureIds as FeatureId[]
    },
  })

  const enabledFeatures = data ?? ALL_FEATURE_IDS

  const isFeatureEnabled = (featureId: FeatureId) =>
    enabledFeatures.includes(featureId)

  return {
    features: enabledFeatures,
    isFeatureEnabled,
    isLoading,
  }
}
