import Anthropic from '@anthropic-ai/sdk'

const _client = new Anthropic()

export function useAnthropicClient(): Anthropic {
  // const { anthropicApiKey, anthropicBaseUrl } = useRuntimeConfig()

  return _client
}
