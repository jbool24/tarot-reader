<template>
  <div class="tarot-app">
    <!-- Animated stars background -->
    <div class="stars-container">
      <div v-for="(style, i) in starStyles" :key="i" class="star" :style="style" />
    </div>

    <!-- Floating mystic particles -->
    <div class="particles-container">
      <div v-for="(style, i) in particleStyles" :key="'p' + i" class="particle" :style="style" />
    </div>

    <div class="content-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="moon-icon">&#9790;</div>
        <h1 class="title">Mystic Tarot Reader</h1>
        <p class="subtitle">Unveil the secrets the cards hold for you</p>
        <div class="ornament">&#10045; &#10047; &#10045;</div>
      </header>

      <!-- Card spread decoration (only shown before a hand is dealt) -->
      <div v-if="!hand" class="card-spread">
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

      <!-- Main area: card table + welcome state -->
      <main class="reading-area">
        <!-- 15-card spread table — always in DOM, hidden until hand is dealt -->
        <div class="card-table" :style="{ display: hand ? 'grid' : 'none' }">

          <!-- Row headers — hidden on desktop, shown on mobile -->
          <div class="spread-row-header spread-row-header--heart">The Heart of the Matter</div>
          <div class="spread-row-header spread-row-header--mirror">The Mirror Within</div>
          <div class="spread-row-header spread-row-header--fate">The Wheel of Fate</div>
          <div class="spread-row-header spread-row-header--future-b">Future B — If No Action Taken</div>
          <div class="spread-row-header spread-row-header--future-a">Future A — If Action Taken</div>

          <div
            v-for="[pos, row, col] in CARD_GRID"
            :key="pos"
            class="spread-card"
            :data-pos="pos"
            :class="{ flipped: flippedCards.has(pos) }"
            :style="{ gridRow: row, gridColumn: col }"
          >
            <div class="card-inner">
              <div class="spread-face card-back">
                <img src="/deck/CardBacks.png" alt="Card back" />
              </div>
              <div class="spread-face card-front" :class="{ reversed: hand?.[pos]?.reversed }">
                <img :src="hand?.[pos]?.image_url" :alt="`Position ${pos}`" />
              </div>
            </div>
            <!-- Tooltip — only appears after the card has flipped -->
            <div v-if="flippedCards.has(pos) && hand?.[pos]" class="card-tooltip">
              <div class="card-tooltip-name">
                {{ hand[pos].name }}
                <span v-if="hand[pos].reversed" class="card-tooltip-reversed">↑ Reversed</span>
              </div>
              <div class="card-tooltip-meaning">{{ hand[pos].meaning }}</div>
            </div>
          </div>
        </div>

        <!-- Welcome state -->
        <div v-if="!hand" class="welcome-state">
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

      <!-- Input area — only shown before a hand is dealt; moves into drawer after -->
      <div v-if="!hand" class="input-area">
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

    <!-- Mobile FAB: reopen drawer when it is closed but reading was requested -->
    <button
      v-if="readingRequested && (messages.length || loading) && !drawerOpen"
      class="mobile-reading-fab"
      @click="drawerOpen = true"
      aria-label="Open reading"
    >
      <span class="fab-icon">✨</span>
      <span class="fab-label">Reading</span>
    </button>

    <!-- Reading drawer — slides in from the right -->
    <aside class="reading-drawer" :class="{ open: drawerOpen, wide: drawerWide }">
      <!-- Tab handle — sticks out from the left edge, visible after reading is requested -->
      <button
        v-if="readingRequested && (messages.length || loading)"
        class="drawer-tab"
        :class="{ attention: hasUnread }"
        @click="drawerOpen = !drawerOpen"
        :title="drawerOpen ? 'Close reading' : 'Open reading'"
      >
        <span class="drawer-tab-icon">{{ drawerOpen ? '✕' : '✨' }}</span>
        <span v-if="!drawerOpen" class="drawer-tab-label">Reading</span>
      </button>

      <div class="drawer-inner">
        <div class="drawer-header">
          <span class="drawer-title">✨ The Mystic Speaks</span>
          <div class="drawer-header-actions">
            <button
              class="drawer-action-btn"
              @click="drawerWide = !drawerWide"
              :title="drawerWide ? 'Narrow view' : 'Wide view'"
            >{{ drawerWide ? '⇥⇤' : '⇤⇥' }}</button>
            <button class="drawer-action-btn" @click="drawerOpen = false" title="Close">✕</button>
          </div>
        </div>

        <div class="messages-container">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="message"
            :class="msg.role"
          >
            <div class="message-icon">{{ msg.role === 'user' ? '🔮' : '✨' }}</div>
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

      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Card {
  name: string
  reversed: boolean
  suit: 'cups' | 'wands' | 'pentacles' | 'swords' | 'arcana'
  meaning: string
  image_url: string
}

type Hand = Record<number, Card>

// [position, gridRow, gridColumn] in a 9-column × 3-row grid
// Row 1: [13][9][5]  ···  [4][8][12]
// Row 2:       [2][1][3]
// Row 3: [14][10][6]  ···  [7][11][15]
const CARD_GRID: [number, number, number][] = [
  [13, 1, 1], [9,  1, 2], [5,  1, 3],
  [4,  1, 7], [8,  1, 8], [12, 1, 9],
  [2,  2, 4], [1,  2, 5], [3,  2, 6],
  [14, 3, 1], [10, 3, 2], [6,  3, 3],
  [7,  3, 7], [11, 3, 8], [15, 3, 9],
]

const userInput = ref('')
const messages = ref<Message[]>([])
const loading = ref(false)
const reading = ref(false)
const drawerOpen = ref(false)
const drawerWide = ref(false)
const hasUnread = ref(false)
const hand = ref<Hand | null>(null)
const readingRequested = ref(false)

// Clear the attention state as soon as the drawer is opened
watch(drawerOpen, (open) => { if (open) hasUnread.value = false })
const flippedCards = reactive(new Set<number>())
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
  'What does my future hold financially?',
  'What career path should I follow?',
  'What energy surrounds me today?',
]

const inputPlaceholder = 'Ask the cards your question...'

const starStyles = Array.from({ length: 60 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 4}s`,
  animationDuration: `${2 + Math.random() * 3}s`,
  width: `${1 + Math.random() * 3}px`,
  height: `${1 + Math.random() * 3}px`,
}))

const particleStyles = Array.from({ length: 15 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 6}s`,
  animationDuration: `${8 + Math.random() * 12}s`,
}))

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

  if (textareaRef.value) textareaRef.value.style.height = 'auto'

  let drawSucceeded = false
  try {
    const drawnHand = await $fetch<Hand>('/api/draw')
    hand.value = drawnHand
    flippedCards.clear()
    await nextTick()
    for (let pos = 1; pos <= 15; pos++) {
      setTimeout(() => flippedCards.add(pos), 100 + pos * 200)
    }
    drawSucceeded = true
  } catch {
    messages.value.push({
      role: 'assistant',
      content: 'The spirits could not draw the cards at this moment. Please try again shortly, dear seeker.',
    })
  } finally {
    loading.value = false
  }

  if (drawSucceeded) await fetchReading()
}

async function fetchReading() {
  if (loading.value || !hand.value || !messages.value.length) return

  readingRequested.value = true
  loading.value = true
  drawerOpen.value = true

  const currentHand = hand.value
  const apiMessages = messages.value.map((m, i) => {
    if (i === 0 && m.role === 'user') {
      return {
        role: 'user' as const,
        content: JSON.stringify({ query: m.content, hand: currentHand }),
      }
    }
    return { role: m.role, content: m.content }
  })

  try {
    const data = await $fetch<{ reply: string }>('/api/tarot', {
      method: 'POST',
      body: { messages: apiMessages },
    })
    messages.value.push({ role: 'assistant', content: data.reply })
    if (!drawerOpen.value) hasUnread.value = true
  } catch {
    messages.value.push({
      role: 'assistant',
      content: 'The cards grow silent... The spirits were unable to speak at this moment. Please try again shortly, dear seeker.',
    })
  } finally {
    loading.value = false
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

/* Card spread decoration */
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
  perspective: 600px;
}

.tarot-card-deco:hover {
  transform: perspective(600px) rotate(var(--rotation)) rotateY(180deg);
  transition-delay: 0s;
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

/* Main reading area */
.reading-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Welcome state */
.welcome-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
  padding: 1rem 0;
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
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
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

/* ── Get Your Reading CTA ───────────────────────────────────────────── */
.reading-cta {
  display: flex;
  justify-content: center;
  padding: 1.25rem 0 0.5rem;
  flex-shrink: 0;
}

.get-reading-btn {
  background: linear-gradient(135deg, #c9a84c, #a08030);
  color: #0a0a1a;
  border: none;
  border-radius: 50px;
  padding: 0.85rem 2.25rem;
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 24px #c9a84c55;
  animation: readingBtnGlow 2.4s ease-in-out infinite;
}

.get-reading-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f4e4a0, #c9a84c);
  box-shadow: 0 6px 32px #c9a84c88;
  transform: translateY(-2px) scale(1.03);
}

.get-reading-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  animation: none;
}

@keyframes readingBtnGlow {
  0%, 100% { box-shadow: 0 4px 20px #c9a84c44; }
  50% { box-shadow: 0 4px 36px #c9a84c99; }
}

/* ── Card table — responsive 15-card spread ─────────────────────────── */
.card-table {
  /* card width scales with viewport; aspect ratio ~1:1.54 (tarot proportions) */
  --cw: clamp(36px, 7.5vw, 80px);
  --ch: calc(var(--cw) * 1.54);
  --cg: clamp(3px, 0.5vw, 8px);

  grid-template-columns: repeat(9, var(--cw));
  grid-template-rows: repeat(3, var(--ch));
  gap: var(--cg);
  justify-content: center;
  padding: 1rem 0;
  flex-shrink: 0;
}

/* Row headers are desktop-hidden; mobile reveals them */
.spread-row-header {
  display: none;
}

.spread-card {
  width: var(--cw);
  height: var(--ch);
  perspective: 600px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.spread-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.spread-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #c9a84c33;
  box-shadow: 0 2px 8px #0006;
}

.spread-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Front face starts rotated away; becomes visible on flip */
.card-front {
  transform: rotateY(180deg);
}

.card-front.reversed img {
  transform: rotate(180deg);
}

/* Card hover — scale up toward the viewer */
.spread-card {
  position: relative;
  transition: transform 0.25s ease;
  z-index: 1;
}

.spread-card:hover {
  transform: scale(1.28);
  z-index: 20;
}

/* Card tooltip */
.card-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: clamp(140px, 18vw, 200px);
  background: linear-gradient(160deg, #0d0921f0, #1e1545f0);
  border: 1px solid #c9a84c66;
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 50;
  text-align: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 6px 24px #00000099;
}

.spread-card:hover .card-tooltip {
  opacity: 1;
}

.card-tooltip-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.6rem;
  color: #c9a84c;
  margin-bottom: 0.3rem;
  line-height: 1.3;
}

.card-tooltip-reversed {
  display: block;
  font-size: 0.55rem;
  color: #a89bc2;
  font-family: 'Crimson Text', serif;
  font-style: italic;
  margin-top: 0.1rem;
}

.card-tooltip-meaning {
  font-size: 0.62rem;
  color: #e8dcc8bb;
  font-style: italic;
  line-height: 1.4;
}

/* ── Reading drawer ─────────────────────────────────────────────────── */
.reading-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(420px, 90vw);
  z-index: 100;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s ease;
  background: linear-gradient(180deg, #0d0921f0 0%, #120d2af2 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-left: 1px solid #c9a84c33;
  box-shadow: -10px 0 50px #00000099;
  display: flex;
  flex-direction: column;
}

.reading-drawer.open {
  transform: translateX(0);
}

.reading-drawer.wide {
  width: 50dvw;
}

/* Vertical tab handle — sticks out from the drawer's left edge */
.drawer-tab {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(180deg, #1e1545, #2a1f5e);
  border: 1px solid #c9a84c55;
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: #c9a84c;
  cursor: pointer;
  padding: 1rem 0.65rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  box-shadow: -4px 0 20px #00000066;
  transition: background 0.3s, box-shadow 0.3s;
}

.drawer-tab:hover {
  background: linear-gradient(180deg, #2a1f5e, #3a2f7e);
  box-shadow: -4px 0 28px #c9a84c22;
}

/* Bounce left to beckon the reader when a response is waiting */
@keyframes tabAttention {
  0%, 55%, 100% { transform: translateY(-50%) translateX(0); }
  10%  { transform: translateY(-50%) translateX(-10px); }
  20%  { transform: translateY(-50%) translateX(-5px); }
  30%  { transform: translateY(-50%) translateX(-10px); }
  40%  { transform: translateY(-50%) translateX(-5px); }
  50%  { transform: translateY(-50%) translateX(-10px); }
}

.drawer-tab.attention {
  animation: tabAttention 2.4s ease-in-out infinite;
  border-color: #c9a84c99;
  box-shadow: -4px 0 28px #c9a84c55;
}

.drawer-tab-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.drawer-tab-label {
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  color: #c9a84ccc;
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.drawer-header {
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid #c9a84c22;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.drawer-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.85rem;
  color: #c9a84c;
  letter-spacing: 0.06em;
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.drawer-action-btn {
  background: none;
  border: none;
  color: #a89bc2;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  line-height: 1;
}

.drawer-action-btn:hover {
  color: #c9a84c;
  background: #c9a84c11;
}

/* Messages inside drawer */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
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

/* Wide drawer — centre content with max-width */
.reading-drawer.wide .messages-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reading-drawer.wide .message {
  width: 100%;
  max-width: 680px;
}

/* ── Mobile reading FAB ─────────────────────────────────────────────── */
.mobile-reading-fab {
  display: none;
}

/* ── Mobile adjustments ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  /*
   * Strategy: make .tarot-app the scroll container instead of html/body.
   * html/body stay overflow:hidden (unchanged). .tarot-app gets a fixed
   * viewport height and scrolls internally. This is the most reliable
   * approach across iOS Safari versions.
   */
  .tarot-app {
    height: 100dvh;
    max-height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /*
   * content-wrapper: height:auto so it can grow beyond the viewport
   * and the parent (.tarot-app) will scroll to reveal it.
   * Bottom padding reserves space for the fixed input bar.
   */
  .content-wrapper {
    height: auto;
    min-height: 100%;
    padding-bottom: 5.5rem;
  }

  /*
   * reading-area: stop using flex:1 / min-height:0 which squashes
   * content into the available space. Let it be naturally sized so the
   * crystal ball + welcome text + chips can breathe.
   */
  .reading-area {
    flex: 0 0 auto;
    min-height: unset;
    justify-content: flex-start;
    padding-top: 0.5rem;
  }

  .welcome-state {
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .card-spread {
    gap: 0.35rem;
    padding: 0.5rem 0;
  }

  .tarot-card-deco {
    width: 36px;
    height: 56px;
  }

  .header {
    padding: 0.75rem 0 0.25rem;
  }

  .moon-icon {
    font-size: 1.5rem;
    margin-bottom: 0;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  .ornament {
    display: none;
  }

  .crystal-ball {
    font-size: 2.5rem;
  }

  .welcome-text {
    font-size: 0.9rem;
    line-height: 1.5;
    padding: 0 0.5rem;
  }

  .suggestion-chips {
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .chip {
    width: 100%;
    max-width: 300px;
    text-align: center;
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }

  /* Fixed input bar — pinned to the bottom of the viewport */
  .input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(0deg, #0d0d2b 80%, transparent 100%);
    z-index: 10;
  }

  /* Drawer: full width, full dynamic viewport height */
  .reading-drawer {
    width: 100vw;
    height: 100dvh;
  }

  /* Hide the side-tab on mobile — we use the FAB instead */
  .drawer-tab {
    display: none;
  }

  /* Hide wide-toggle button (already full width on mobile) */
  .drawer-header-actions .drawer-action-btn:first-child {
    display: none;
  }

  /* Floating action button — visible when drawer is closed */
  .mobile-reading-fab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: fixed;
    bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
    right: 1rem;
    z-index: 150;
    background: linear-gradient(135deg, #c9a84c, #a08030);
    color: #0a0a1a;
    border: none;
    border-radius: 50px;
    padding: 0.7rem 1.2rem;
    font-family: 'Cinzel Decorative', serif;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    box-shadow: 0 4px 24px #c9a84c66;
    animation: fabGlow 2s ease-in-out infinite;
  }

  .mobile-reading-fab .fab-icon {
    font-size: 1rem;
    line-height: 1;
  }

  @keyframes fabGlow {
    0%, 100% { box-shadow: 0 4px 20px #c9a84c55; }
    50% { box-shadow: 0 4px 32px #c9a84c99; }
  }

  /* Card table: reflow into a 3-column layout with labelled sections */
  .card-table {
    --cw: clamp(80px, 28vw, 110px);
    --cg: 8px;
    grid-template-columns: repeat(3, var(--cw));
    grid-template-rows: auto;
    padding: 0.5rem 0;
    overflow-x: visible;
    max-width: 100vw;
    row-gap: 0.5rem;
  }

  /* Section headers span all 3 columns */
  .spread-row-header {
    display: flex;
    align-items: center;
    grid-column: 1 / 4;
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c9a84c;
    opacity: 0.85;
    padding: 0.4rem 0 0.1rem;
    gap: 0.5rem;
  }
  .spread-row-header::before,
  .spread-row-header::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #c9a84c55);
  }
  .spread-row-header::after {
    background: linear-gradient(270deg, transparent, #c9a84c55);
  }

  /* Header placement — interpretation order */
  .spread-row-header--heart    { grid-row: 1; }
  .spread-row-header--mirror   { grid-row: 3; }
  .spread-row-header--fate     { grid-row: 5; }
  .spread-row-header--future-b { grid-row: 7; }
  .spread-row-header--future-a { grid-row: 9; }

  /* Card placement — override inline gridRow/gridColumn */
  .card-table .spread-card[data-pos="2"]  { grid-row: 2 !important; grid-column: 1 !important; }
  .card-table .spread-card[data-pos="1"]  { grid-row: 2 !important; grid-column: 2 !important; }
  .card-table .spread-card[data-pos="3"]  { grid-row: 2 !important; grid-column: 3 !important; }
  .card-table .spread-card[data-pos="14"] { grid-row: 4 !important; grid-column: 1 !important; }
  .card-table .spread-card[data-pos="10"] { grid-row: 4 !important; grid-column: 2 !important; }
  .card-table .spread-card[data-pos="6"]  { grid-row: 4 !important; grid-column: 3 !important; }
  .card-table .spread-card[data-pos="7"]  { grid-row: 6 !important; grid-column: 1 !important; }
  .card-table .spread-card[data-pos="11"] { grid-row: 6 !important; grid-column: 2 !important; }
  .card-table .spread-card[data-pos="15"] { grid-row: 6 !important; grid-column: 3 !important; }
  .card-table .spread-card[data-pos="4"]  { grid-row: 8 !important; grid-column: 1 !important; }
  .card-table .spread-card[data-pos="8"]  { grid-row: 8 !important; grid-column: 2 !important; }
  .card-table .spread-card[data-pos="12"] { grid-row: 8 !important; grid-column: 3 !important; }
  .card-table .spread-card[data-pos="13"] { grid-row: 10 !important; grid-column: 1 !important; }
  .card-table .spread-card[data-pos="9"]  { grid-row: 10 !important; grid-column: 2 !important; }
  .card-table .spread-card[data-pos="5"]  { grid-row: 10 !important; grid-column: 3 !important; }

  /* Card tooltips: keep them on-screen */
  .card-tooltip {
    width: clamp(100px, 40vw, 160px);
  }

}
</style>
