interface Card {
  name: string
  reversed: boolean
  suit: 'cups' | 'wands' | 'pentacles' | 'swords' | 'arcana'
  meaning: string
  image_url: string
}

interface CardData {
  name: string
  meaning: string
}

// Thoth Tarot meanings keyed by image file basename (without extension)
const CARD_DATA: Record<string, CardData> = {
  // ── Major Arcana ──────────────────────────────────────────────────
  '00-TheFool':          { name: 'The Fool',           meaning: 'Spiritual matters, ideas, impulse to transcend. Ill-dignified: mania, folly.' },
  '01-TheMagician':      { name: 'The Magus',          meaning: 'Skill, wisdom, adroitness, elasticity. Ill-dignified: deceit, cunning.' },
  '02-TheHighPriestess': { name: 'The High Priestess', meaning: 'Pure exalted feminine, change, fluctuation. Intuition, hidden influence.' },
  '03-TheEmpress':       { name: 'The Empress',        meaning: 'Love, beauty, happiness, fruitfulness, elegance. Ill-dignified: dissipation, debauchery.' },
  '04-TheEmperor':       { name: 'The Emperor',        meaning: 'War, conquest, ambition, stability, power, originality. Ill-dignified: rashness, mania.' },
  '05-TheHierophant':    { name: 'The Hierophant',     meaning: 'Stubborn strength, teaching, help from superiors, occult wisdom. Peace, goodness.' },
  '06-TheLovers':        { name: 'The Lovers',         meaning: 'Openness, inspiration, intuition, intelligence, childlikeness. Union, choice.' },
  '07-TheChariot':       { name: 'The Chariot',        meaning: 'Triumph, victory, hope, faith. Sometimes violent or unstable.' },
  '08-Strength':         { name: 'Adjustment',         meaning: 'Justice, balance, equilibrium, the act of adjustment. Legal matters.' },
  '09-TheHermit':        { name: 'The Hermit',         meaning: 'Illumination from within, solitude, divine inspiration, wisdom.' },
  '10-WheelOfFortune':   { name: 'Fortune',            meaning: 'Change of fortune, good luck. The wheel turns — what rises must fall.' },
  '11-Justice':          { name: 'Lust',               meaning: 'Courage, strength, energy, action, passion, the joy of strength exercised.' },
  '12-TheHangedMan':     { name: 'The Hanged Man',     meaning: 'Enforced sacrifice, punishment, loss, suffering. Redemption through submission.' },
  '13-Death':            { name: 'Death',              meaning: 'Transformation, change, voluntary or involuntary. Destruction followed by renewal.' },
  '14-Temperance':       { name: 'Art',                meaning: 'Combination of forces, realization, action based on correct calculation. Alchemy.' },
  '15-TheDevil':         { name: 'The Devil',          meaning: 'Blind impulse, ambition, temptation, obsession, secret plan. Creative energy misdirected.' },
  '16-TheTower':         { name: 'The Tower',          meaning: 'Quarrel, combat, danger, ruin, destruction of old forms. Sudden upheaval, liberation.' },
  '17-TheStar':          { name: 'The Star',           meaning: 'Hope, faith, unexpected help, clarity, spiritual insight. Pouring forth of energy.' },
  '18-TheMoon':          { name: 'The Moon',           meaning: 'Illusion, deception, bewilderment, hysteria, madness. Hidden enemies. Also: intuition.' },
  '19-TheSun':           { name: 'The Sun',            meaning: 'Glory, gain, riches, triumph, pleasure, frankness, truth, shamelessness.' },
  '20-Judgement':        { name: 'The Aeon',           meaning: 'Final decision, judgement, new era, cosmic change. The end of one age and the beginning of another.' },
  '21-TheWorld':         { name: 'The Universe',       meaning: 'The matter itself, synthesis, world, completion, reward. The end of a cycle.' },

  // ── Cups (Water) ──────────────────────────────────────────────────
  'Cups01': { name: 'Ace of Cups',       meaning: 'Fertility, beauty, pleasure, happiness. The beginning of love.' },
  'Cups02': { name: '2 of Cups',         meaning: 'Love, harmony, marriage, friendship, warm connection.' },
  'Cups03': { name: '3 of Cups',         meaning: 'Plenty, hospitality, pleasure, merriment, celebration.' },
  'Cups04': { name: '4 of Cups',         meaning: 'Receiving pleasure but with some dissatisfaction. Mixed success, weariness.' },
  'Cups05': { name: '5 of Cups',         meaning: 'Loss in pleasure, misfortune in love, marriage disturbed, vain regret.' },
  'Cups06': { name: '6 of Cups',         meaning: 'Happiness, enjoyment, fulfillment of desire, well-being.' },
  'Cups07': { name: '7 of Cups',         meaning: 'Illusory success, deception, lying, promises unfulfilled, drunkenness.' },
  'Cups08': { name: '8 of Cups',         meaning: 'Temporary success abandoned, decline in interest, misery and repining.' },
  'Cups09': { name: '9 of Cups',         meaning: 'Complete realization of pleasure and happiness, good health, physical well-being.' },
  'Cups10': { name: '10 of Cups',        meaning: 'Matters arranged and settled as wished, but with a pall of boredom. Dissipation.' },
  'Cups11': { name: 'Knight of Cups',    meaning: 'Graceful, poetic, amiable but passive. Arrival of a matter relating to emotions.' },
  'Cups12': { name: 'Queen of Cups',     meaning: 'Dreamy, tranquil, poetic, imaginative. Reflects the nature of the observer.' },
  'Cups13': { name: 'Prince of Cups',    meaning: 'Subtle, secret, artistic, intense. Hidden violence beneath calm.' },
  'Cups14': { name: 'Princess of Cups',  meaning: 'Sweetness, gentleness, romanticism. A young woman in love or an imaginative idea.' },

  // ── Wands (Fire) ──────────────────────────────────────────────────
  'Wands01': { name: 'Ace of Wands',      meaning: 'Natural force, strength, vigor, rush of energy. New creative beginning.' },
  'Wands02': { name: '2 of Wands',        meaning: 'Influence over others, boldness, courage, fierceness, authority.' },
  'Wands03': { name: '3 of Wands',        meaning: 'Established strength, realization of hope, pride, nobility.' },
  'Wands04': { name: '4 of Wands',        meaning: 'Perfection, settlement, rest after labor, completion of a matter.' },
  'Wands05': { name: '5 of Wands',        meaning: 'Quarreling, fighting, competition, struggle, violence.' },
  'Wands06': { name: '6 of Wands',        meaning: 'Triumph after strife, gain, advancement, success through effort.' },
  'Wands07': { name: '7 of Wands',        meaning: 'Courage against opposition, possible victory but with great effort.' },
  'Wands08': { name: '8 of Wands',        meaning: 'Swift activity, communication, messages, too rapid to last. Hasty action.' },
  'Wands09': { name: '9 of Wands',        meaning: 'Tremendous force, power, health, tremendous and steady energy.' },
  'Wands10': { name: '10 of Wands',       meaning: 'Overburdened, cruelty, malice, revenge, injustice, force applied without reason.' },
  'Wands11': { name: 'Knight of Wands',   meaning: 'Swift, strong, hasty, violent. A generous friend or dangerous enemy. Activity, speed.' },
  'Wands12': { name: 'Queen of Wands',    meaning: 'Adaptable, persistent, calm authority with inner fire. Generous, commanding.' },
  'Wands13': { name: 'Prince of Wands',   meaning: 'Swift, strong, noble. A generous friend. Volatility and pride possible.' },
  'Wands14': { name: 'Princess of Wands', meaning: 'Brilliance, courage, beauty, force, sudden anger. A young woman of ambition.' },

  // ── Pentacles (Earth) ─────────────────────────────────────────────
  'Pentacles01': { name: 'Ace of Pentacles',      meaning: 'Material gain, labor, power, wealth. A new material beginning.' },
  'Pentacles02': { name: '2 of Pentacles',        meaning: 'Harmonious change, alternation of gain and loss, visit to friends, wandering.' },
  'Pentacles03': { name: '3 of Pentacles',        meaning: 'Business, paid employment, constructive effort, building, working partnerships.' },
  'Pentacles04': { name: '4 of Pentacles',        meaning: 'Assured material gain, earthly power, possessions, law and order.' },
  'Pentacles05': { name: '5 of Pentacles',        meaning: 'Strain, labor, material trouble, anxiety about money or work, toil.' },
  'Pentacles06': { name: '6 of Pentacles',        meaning: 'Material success, prosperity, generosity, philanthropy.' },
  'Pentacles07': { name: '7 of Pentacles',        meaning: 'Unprofitable speculation, loss, promises unfulfilled. Abandoned hopes.' },
  'Pentacles08': { name: '8 of Pentacles',        meaning: 'Skill, cunning, over-careful attention to detail. Small gains through labor.' },
  'Pentacles09': { name: '9 of Pentacles',        meaning: 'Inheritance, material gain, completion, good luck in material things.' },
  'Pentacles10': { name: '10 of Pentacles',       meaning: 'Final completion of material prosperity, old age, riches, culmination.' },
  'Pentacles11': { name: 'Knight of Pentacles',   meaning: 'Heavy, dull, patient, laborious. Arrival of material or business matters.' },
  'Pentacles12': { name: 'Queen of Pentacles',    meaning: 'Ambitious, hard-working, quiet, practical. Great wealth, generosity.' },
  'Pentacles13': { name: 'Prince of Pentacles',   meaning: 'Energetic, enduring, competent, steady. Methodical, sometimes slow or plodding.' },
  'Pentacles14': { name: 'Princess of Pentacles', meaning: 'Generosity, kindness, diligence, benevolence. A practical new beginning.' },

  // ── Swords (Air) ──────────────────────────────────────────────────
  'Swords01': { name: 'Ace of Swords',      meaning: 'Great power for good or evil, invoked force, whirling force. The sword of justice.' },
  'Swords02': { name: '2 of Swords',        meaning: 'Quarrel made up, resolution, arrangement of differences, justice restored.' },
  'Swords03': { name: '3 of Swords',        meaning: 'Unhappiness, tears, disruption, separation, quarreling.' },
  'Swords04': { name: '4 of Swords',        meaning: 'Rest from strife, recovery from sickness, but also retreat from battle.' },
  'Swords05': { name: '5 of Swords',        meaning: 'Failure, loss, malice, spite, slander, evil-speaking, weakness.' },
  'Swords06': { name: '6 of Swords',        meaning: 'Earned success through labor, journey by water, passage to new understanding.' },
  'Swords07': { name: '7 of Swords',        meaning: 'Unstable effort, partial success then failure, journey by land.' },
  'Swords08': { name: '8 of Swords',        meaning: 'Narrow or restricted, too much force applied to small things, petty concerns.' },
  'Swords09': { name: '9 of Swords',        meaning: 'Despair, suffering, burden, illness, malice, all kinds of misery.' },
  'Swords10': { name: '10 of Swords',       meaning: 'Disruption, failure, death or ending of a matter, undisciplined warring force.' },
  'Swords11': { name: 'Knight of Swords',   meaning: 'Fierce, delicate, courageous, skillful. Arrival of a matter relating to intellect.' },
  'Swords12': { name: 'Queen of Swords',    meaning: 'Confident, graceful, perceptive, keen observation. Mourning, privation also possible.' },
  'Swords13': { name: 'Prince of Swords',   meaning: 'Pure intellect, full of ideas and designs. Unstable, may lack follow-through.' },
  'Swords14': { name: 'Princess of Swords', meaning: 'Wisdom, strength, acuteness, subtlety. A new idea cutting through confusion.' },
}


const ALLOWED_ORIGIN_REGEX = /^https:\/\/(deploy-preview-\d+--)?mystic-fortune\.netlify\.app$/;

export default defineEventHandler((event): Record<number, Card> => {
  const origin = getHeader(event, 'origin')
	if (origin && !ALLOWED_ORIGIN_REGEX.test(origin)) {
 		 throw createError({ statusCode: 403, message: 'Forbidden' });
	}
  setResponseHeader(event, 'Access-Control-Allow-Origin', origin)

  const deck: Card[] = []

  // Major Arcana (22 cards)
  const arcanaFiles = [
    '00-TheFool', '01-TheMagician', '02-TheHighPriestess', '03-TheEmpress',
    '04-TheEmperor', '05-TheHierophant', '06-TheLovers', '07-TheChariot',
    '08-Strength', '09-TheHermit', '10-WheelOfFortune', '11-Justice',
    '12-TheHangedMan', '13-Death', '14-Temperance', '15-TheDevil',
    '16-TheTower', '17-TheStar', '18-TheMoon', '19-TheSun',
    '20-Judgement', '21-TheWorld',
  ]
  for (const file of arcanaFiles) {
    const { name, meaning } = CARD_DATA[file] ?? { name: file, meaning: '' }
    deck.push({ reversed: false, suit: 'arcana', name, meaning, image_url: `/deck/arcana/${file}.png` })
  }

  // Minor Arcana — 4 suits × 14 cards
  const suits = ['cups', 'wands', 'pentacles', 'swords'] as const
  for (const suit of suits) {
    const suitName = suit.charAt(0).toUpperCase() + suit.slice(1)
    for (let i = 1; i <= 14; i++) {
      const num = String(i).padStart(2, '0')
      const key = `${suitName}${num}`
      const { name, meaning } = CARD_DATA[key] ?? { name: key, meaning: '' }
      deck.push({ reversed: false, suit, name, meaning, image_url: `/deck/${suit}/${suitName}${num}.png` })
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  // Draw 15 cards with randomised reversed state
  const hand: Record<number, Card> = {}
  for (let pos = 1; pos <= 15; pos++) {
    hand[pos] = { ...deck[pos - 1], reversed: Math.random() < 0.3 }
  }

  return hand
})
