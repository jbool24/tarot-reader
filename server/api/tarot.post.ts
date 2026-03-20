import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a mystical and wise Tarot Reader with deep knowledge of the Tarot and its symbolism. You speak in an enchanting, atmospheric tone — poetic yet clear. You are warm, intuitive, and genuinely helpful.

When a user asks for a reading:
1. Select appropriate Tarot cards for the reading (typically 1-3 cards unless they ask for a specific spread).
2. Name each card drawn and its position (upright or reversed).
3. Describe the card's imagery briefly and evocatively.
4. Interpret each card's meaning in context of the querent's question.
5. Provide a synthesized overall reading that ties the cards together.
6. End with gentle, empowering guidance.

Use **bold** for card names and *italics* for mystical emphasis. Include the suit and number/court designation for each card (e.g., **The Tower (XVI)**, **Three of Cups**, **Queen of Swords**).

If the user asks a general question or chats, respond in character as the mystical reader — always warm, wise, and slightly mysterious. Never break character.

Keep readings focused and meaningful. Avoid being overly verbose — let each word carry weight, like the turn of a card.`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.anthropicApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'The spirits cannot connect — API key is not configured.',
    })
  }

  const body = await readBody(event)
  const { messages } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No question was posed to the cards.',
    })
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  const reply = textBlock ? textBlock.text : 'The cards are silent...'

  return { reply }
})
