<template>
  <div class="tarot-app">
    <!-- Animated stars background -->
    <div class="stars-container">
      <div v-for="n in 60" :key="n" class="star" :style="randomStarStyle()" />
    </div>

    <!-- Floating mystic particles -->
    <div class="particles-container">
      <div v-for="n in 15" :key="'p' + n" class="particle" :style="randomParticleStyle()" />
    </div>

    <div class="content-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="moon-icon">&#9790;</div>
        <h1 class="title">Mystic Tarot Reader</h1>
        <p class="subtitle">Unveil the secrets the cards hold for you</p>
        <div class="ornament">&#10045; &#10047; &#10045;</div>
      </header>

      <!-- Card spread decoration -->
      <div class="card-spread">
        <div
          v-for="(card, i) in decorativeCards"
          :key="i"
          class="tarot-card-deco"
          :class="{ 'card-revealed': reading }"
          :style="{ '--delay': `${i * 0.15}s`, '--rotation': `${card.rotation}deg` }"
        >
          <div class="card-face">
            <span class="card-symbol">{{ card.symbol }}</span>
          </div>
        </div>
      </div>

      <!-- Chat / Reading area -->
      <main class="reading-area">
        <div v-if="messages.length" class="messages-container" ref="messagesContainer">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="message"
            :class="msg.role"
          >
            <div class="message-icon">
              {{ msg.role === 'user' ? '🔮' : '✨' }}
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)" />
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="loading" class="message assistant">
            <div class="message-icon">✨</div>
            <div class="message-content">
              <div class="loading-orbs">
                <span class="orb" />
                <span class="orb" />
                <span class="orb" />
              </div>
            </div>
          </div>
        </div>

        <!-- Welcome state -->
        <div v-else class="welcome-state">
          <div class="crystal-ball">🔮</div>
          <p class="welcome-text">
            The cards await your question, dear seeker.<br />
            Ask about love, career, destiny, or whatever weighs upon your soul.
          </p>
          <div class="suggestion-chips">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              class="chip"
              @click="useSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </main>

      <!-- Input area -->
      <div class="input-area">
        <div class="input-wrapper">
          <textarea
            v-model="userInput"
            :placeholder="inputPlaceholder"
            class="question-input"
            :disabled="loading"
            rows="1"
            @keydown.enter.exact.prevent="submitQuestion"
            @input="autoResize"
            ref="textareaRef"
          />
          <button
            class="submit-btn"
            :disabled="!userInput.trim() || loading"
            @click="submitQuestion"
          >
            <span class="btn-icon">&#10024;</span>
          </button>
        </div>
        <p class="input-hint">Press Enter to consult the cards</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const userInput = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const reading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const decorativeCards = [
  { symbol: '☽', rotation: -15 },
  { symbol: '★', rotation: -5 },
  { symbol: '☉', rotation: 5 },
  { symbol: '★', rotation: 15 },
  { symbol: '☾', rotation: 25 },
]

const suggestions = [
  'What does my love life hold?',
  'Give me a three-card reading',
  'What career path should I follow?',
  'What energy surrounds me today?',
]

const inputPlaceholder = 'Ask the cards your question...'

function randomStarStyle() {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
    width: `${1 + Math.random() * 3}px`,
    height: `${1 + Math.random() * 3}px`,
  }
}

function randomParticleStyle() {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${8 + Math.random() * 12}s`,
  }
}

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

function autoResize() {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

function useSuggestion(text: string) {
  userInput.value = text
  submitQuestion()
}

async function submitQuestion() {
  const question = userInput.value.trim()
  if (!question || loading.value) return

  messages.value.push({ role: 'user', content: question })
  userInput.value = ''
  loading.value = true
  reading.value = true

  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  await nextTick()
  scrollToBottom()

  try {
    const response = await $fetch('/api/tarot', {
      method: 'POST',
      body: {
        messages: messages.value.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
    })

    messages.value.push({
      role: 'assistant',
      content: response.reply,
    })
  } catch {
    messages.value.push({
      role: 'assistant',
      content:
        'The spirits are restless and cannot channel their wisdom at this moment. Please try again shortly, dear seeker.',
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style>
/* Reset & Base */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow: hidden;
}

body {
  background: #0a0a1a;
  color: #e8dcc8;
  font-family: 'Crimson Text', Georgia, serif;
}
</style>

<style scoped>
.tarot-app {
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at top, #1a1040 0%, #0d0d2b 40%, #080818 100%);
  position: relative;
  overflow: hidden;
}

/* Stars */
.stars-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.1; transform: scale(0.8); }
  100% { opacity: 0.9; transform: scale(1.2); }
}

/* Particles */
.particles-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #c9a84c88, transparent);
  border-radius: 50%;
  animation: float ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
  25% { opacity: 0.6; }
  50% { transform: translate(30px, -60px) scale(1.5); opacity: 0.8; }
  75% { opacity: 0.4; }
}

/* Content */
.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
}

/* Header */
.header {
  text-align: center;
  padding: 1.5rem 0 0.5rem;
  flex-shrink: 0;
}

.moon-icon {
  font-size: 2rem;
  color: #c9a84c;
  text-shadow: 0 0 20px #c9a84c66;
  margin-bottom: 0.25rem;
}

.title {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #c9a84c, #f4e4a0, #c9a84c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 10px #c9a84c44);
}

.subtitle {
  font-style: italic;
  color: #a89bc2;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.ornament {
  color: #c9a84c66;
  font-size: 0.85rem;
  letter-spacing: 0.5rem;
  margin-top: 0.25rem;
}

/* Card spread */
.card-spread {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
  flex-shrink: 0;
}

.tarot-card-deco {
  width: 45px;
  height: 70px;
  border-radius: 6px;
  background: linear-gradient(145deg, #1e1545, #2a1f5e);
  border: 1px solid #c9a84c44;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(var(--rotation));
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--delay);
  box-shadow: 0 2px 15px #0008, 0 0 10px #c9a84c22;
}

.tarot-card-deco.card-revealed {
  transform: rotate(0deg) scale(1.05);
  border-color: #c9a84c88;
  box-shadow: 0 4px 20px #c9a84c33;
}

.card-face {
  font-size: 1.2rem;
  color: #c9a84c;
}

/* Reading / Messages area */
.reading-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  scroll-behavior: smooth;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c9a84c44;
  border-radius: 2px;
}

.message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 0.1rem;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message.user .message-text {
  background: linear-gradient(135deg, #2a1f5e88, #1e154588);
  border: 1px solid #c9a84c33;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #f4e4a0;
  font-size: 1rem;
  line-height: 1.6;
}

.message.assistant .message-text {
  color: #e8dcc8;
  font-size: 1.05rem;
  line-height: 1.7;
  padding: 0.5rem 0;
}

.message.assistant .message-text :deep(strong) {
  color: #c9a84c;
  font-weight: 700;
}

.message.assistant .message-text :deep(em) {
  color: #a89bc2;
}

/* Loading orbs */
.loading-orbs {
  display: flex;
  gap: 6px;
  padding: 0.75rem 0;
}

.orb {
  width: 8px;
  height: 8px;
  background: #c9a84c;
  border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
}

.orb:nth-child(2) { animation-delay: 0.2s; }
.orb:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Welcome state */
.welcome-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
}

.crystal-ball {
  font-size: 4rem;
  animation: bobble 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px #c9a84c44);
}

@keyframes bobble {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #a89bc2;
  max-width: 500px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  max-width: 500px;
}

.chip {
  background: linear-gradient(135deg, #1e1545cc, #2a1f5ecc);
  border: 1px solid #c9a84c44;
  color: #e8dcc8;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chip:hover {
  border-color: #c9a84c;
  background: linear-gradient(135deg, #2a1f5e, #3a2f7e);
  box-shadow: 0 0 15px #c9a84c33;
  transform: translateY(-1px);
}

/* Input area */
.input-area {
  flex-shrink: 0;
  padding: 0.75rem 0 1.5rem;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  background: linear-gradient(135deg, #15102e, #1c1640);
  border: 1px solid #c9a84c44;
  border-radius: 16px;
  padding: 0.5rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #c9a84c88;
  box-shadow: 0 0 20px #c9a84c22;
}

.question-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e8dcc8;
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 1.05rem;
  padding: 0.5rem;
  resize: none;
  line-height: 1.5;
  max-height: 120px;
}

.question-input::placeholder {
  color: #a89bc266;
  font-style: italic;
}

.submit-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #c9a84c, #a08030);
  color: #0a0a1a;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f4e4a0, #c9a84c);
  box-shadow: 0 0 20px #c9a84c44;
  transform: scale(1.05);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon {
  line-height: 1;
}

.input-hint {
  text-align: center;
  font-size: 0.75rem;
  color: #a89bc244;
  margin-top: 0.5rem;
  font-style: italic;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .card-spread {
    gap: 0.35rem;
  }

  .tarot-card-deco {
    width: 36px;
    height: 56px;
  }

  .header {
    padding: 1rem 0 0.25rem;
  }

  .suggestion-chips {
    flex-direction: column;
    align-items: center;
  }
}
</style>
