import Anthropic from '@anthropic-ai/sdk'

export function useAnthropicClient(): Anthropic {
  const { anthropicApiKey, anthropicBaseUrl } = useRuntimeConfig()

  return new Anthropic({
    apiKey: anthropicApiKey,
    ...(anthropicBaseUrl ? { baseURL: anthropicBaseUrl } : {}),
  })
}
