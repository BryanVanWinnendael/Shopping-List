const CAPABILITY_PATTERNS = [
    /^what can (you|u)( do)?[?.!]*$/,
    /^what do you do[?.!]*$/,
    /^how can you help( me)?[?.!]*$/,
    /^help( me)?[?.!]*$/,
    /^features[?.!]*$/,
    /^what'?s? (your )?(features|capabilities)[?.!]*$/,
    /^what are (your )?(features|capabilities)[?.!]*$/,
    /^capabilities[?.!]*$/,
    /^who are you[?.!]*$/,
    /^what are you[?.!]*$/,
]

export function isCapabilitiesQuestion(input: string) {
    const normalized = input.trim().toLowerCase()
    return CAPABILITY_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function getCapabilitiesReply(pageTitle: string) {
    return `Here's what I can do:

- **Find things** — ask about your products, recipes, or week plan
- **Add to your list** — "add 5 apples", or on a recipe page "add everything"
- **Convert servings** — "convert this recipe for 6 persons", or "5 apples for 5 persons, make it 1"
- **Cooking help** — substitutions, explanations, times, and techniques

I always know which page you're on — right now that's ${pageTitle} — and what's on it, so just ask.`
}
