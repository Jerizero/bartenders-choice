import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import cocktailsData from '../data/cocktails.json'
import imageMap from '../data/image-map.json'
import type { Cocktail } from '../types'

const cocktails = cocktailsData as Cocktail[]
const imgMap = imageMap as Record<string, string>

type Step = 'choose' | 'baseAlcohol' | 'sensation' | 'style' | 'strength' | 'results'

const SPIRIT_FIRST: Step[] = ['choose', 'baseAlcohol', 'sensation', 'style', 'strength', 'results']
const MOOD_FIRST: Step[] = ['choose', 'sensation', 'baseAlcohol', 'style', 'strength', 'results']

const STEP_LABELS: Record<Step, string> = {
  choose: 'How do you want to start?',
  baseAlcohol: 'What spirit are you in the mood for?',
  sensation: 'How do you want it to feel?',
  style: 'How should it be made?',
  strength: 'Light or dark?',
  results: 'Here are your matches',
}

// Curated options (most popular/useful from data)
const SENSATION_OPTIONS = [
  'refreshing', 'boozy', 'sweet', 'dry', 'sour', 'bittersweet',
  'fruity', 'herbal', 'spicy', 'creamy', 'smoky', 'tropical',
]
const STYLE_OPTIONS = [
  'shaken (up)', 'shaken (rocks)', 'stirred (up)', 'stirred (rocks)',
  'fizzy', 'tiki', 'crushed', 'tall',
]
const STRENGTH_OPTIONS = ['light', 'dark', 'both']

const BASE_ALCOHOL_OPTIONS = [
  'gin', 'whiskey', 'bourbon', 'rye', 'rum', 'tequila', 'mezcal',
  'vodka', 'brandy', 'cognac', 'scotch', 'champagne',
]

function getOptionsWithCounts(
  pool: Cocktail[],
  field: 'sensation' | 'style',
  options: string[]
): { value: string; count: number }[] {
  return options.map((opt) => ({
    value: opt,
    count: pool.filter((c) => c[field].includes(opt)).length,
  }))
}

function getStrengthCounts(pool: Cocktail[]) {
  return STRENGTH_OPTIONS.map((opt) => ({
    value: opt,
    count: pool.filter((c) => c.lightDark === opt || (opt === 'both' && c.lightDark === 'both')).length,
  }))
}

export default function IFeelLike() {
  const [step, setStep] = useState<Step>('choose')
  const [flow, setFlow] = useState<Step[]>(SPIRIT_FIRST)
  const [selections, setSelections] = useState<{
    baseAlcohol: string | null
    sensation: string | null
    style: string | null
    strength: string | null
  }>({ baseAlcohol: null, sensation: null, style: null, strength: null })

  // Filter pools — order-independent, always apply all active filters
  const poolAfterAlcohol = useMemo(() => {
    if (!selections.baseAlcohol) return cocktails
    return cocktails.filter((c) => c.alcohol.includes(selections.baseAlcohol!))
  }, [selections.baseAlcohol])

  const poolAfterSensation = useMemo(() => {
    if (!selections.sensation) return poolAfterAlcohol
    return poolAfterAlcohol.filter((c) => c.sensation.includes(selections.sensation!))
  }, [poolAfterAlcohol, selections.sensation])

  const poolAfterStyle = useMemo(() => {
    if (!selections.style) return poolAfterSensation
    return poolAfterSensation.filter((c) => c.style.includes(selections.style!))
  }, [poolAfterSensation, selections.style])

  const finalPool = useMemo(() => {
    if (!selections.strength) return poolAfterStyle
    if (selections.strength === 'both') return poolAfterStyle
    return poolAfterStyle.filter(
      (c) => c.lightDark === selections.strength || c.lightDark === 'both'
    )
  }, [poolAfterStyle, selections.strength])

  // Current pool for showing counts (everything filtered so far)
  const currentPool = useMemo(() => {
    let pool = cocktails
    if (selections.baseAlcohol) pool = pool.filter((c) => c.alcohol.includes(selections.baseAlcohol!))
    if (selections.sensation) pool = pool.filter((c) => c.sensation.includes(selections.sensation!))
    return pool
  }, [selections.baseAlcohol, selections.sensation])

  const stepIndex = flow.indexOf(step)
  // Filter steps for progress dots (exclude 'choose' and 'results')
  const filterSteps = flow.filter((s) => s !== 'choose' && s !== 'results')
  const filterStepIndex = (filterSteps as Step[]).indexOf(step)

  function chooseFlow(startWith: 'spirit' | 'mood') {
    const f = startWith === 'spirit' ? SPIRIT_FIRST : MOOD_FIRST
    setFlow(f)
    setStep(f[1]) // skip 'choose', go to first real step
  }

  function select(field: 'baseAlcohol' | 'sensation' | 'style' | 'strength', value: string) {
    setSelections((prev) => ({ ...prev, [field]: value }))
    const nextStep = flow[flow.indexOf(step) + 1]
    if (nextStep) setStep(nextStep)
  }

  function goBack() {
    if (stepIndex <= 0) return
    const prevStep = flow[stepIndex - 1]
    setStep(prevStep)
  }

  function startOver() {
    setSelections({ baseAlcohol: null, sensation: null, style: null, strength: null })
    setFlow(SPIRIT_FIRST)
    setStep('choose')
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center py-4 font-sans">
        I Feel Like...
      </h1>

      {/* Progress dots (only show after choosing a flow) */}
      {step !== 'choose' && (
        <div className="flex justify-center gap-2 mb-6">
          {filterSteps.map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < filterStepIndex ? 'bg-gold' : i === filterStepIndex ? 'bg-gold/60' : 'bg-charcoal-lighter'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step question */}
      <p className="text-cream text-center text-sm mb-6 font-sans tracking-wider">
        {STEP_LABELS[step]}
      </p>

      {/* Current selections */}
      {(selections.baseAlcohol || selections.sensation || selections.style || selections.strength) && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {selections.baseAlcohol && (
            <span className="text-[10px] tracking-wider uppercase font-sans px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              {selections.baseAlcohol}
            </span>
          )}
          {selections.sensation && (
            <span className="text-[10px] tracking-wider uppercase font-sans px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              {selections.sensation}
            </span>
          )}
          {selections.style && (
            <span className="text-[10px] tracking-wider uppercase font-sans px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              {selections.style}
            </span>
          )}
          {selections.strength && (
            <span className="text-[10px] tracking-wider uppercase font-sans px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              {selections.strength}
            </span>
          )}
        </div>
      )}

      {/* Choose starting path */}
      {step === 'choose' && (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => chooseFlow('spirit')}
            className="px-6 py-5 rounded-lg border border-charcoal-lighter text-sm font-sans tracking-wider text-cream hover:border-gold/50 hover:text-gold active:bg-gold/10 transition-colors"
          >
            By Spirit
            <span className="block text-[10px] text-cream-dim mt-1">I know what base I want</span>
          </button>
          <button
            onClick={() => chooseFlow('mood')}
            className="px-6 py-5 rounded-lg border border-charcoal-lighter text-sm font-sans tracking-wider text-cream hover:border-gold/50 hover:text-gold active:bg-gold/10 transition-colors"
          >
            By Mood
            <span className="block text-[10px] text-cream-dim mt-1">I know how I want it to feel</span>
          </button>
        </div>
      )}

      {/* Base alcohol step */}
      {step === 'baseAlcohol' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {BASE_ALCOHOL_OPTIONS.map((opt) => {
              const count = currentPool.filter((c) => c.alcohol.includes(opt)).length
              return (
                <button
                  key={opt}
                  onClick={() => select('baseAlcohol', opt)}
                  disabled={count === 0}
                  className="px-4 py-3 rounded-lg border border-charcoal-lighter text-sm font-sans tracking-wider capitalize text-cream hover:border-gold/50 hover:text-gold active:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {opt}
                  <span className="block text-[10px] text-cream-dim mt-0.5">{count} cocktails</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => select('baseAlcohol', '')} className="w-full mt-3 text-cream-dim text-xs underline">
            Skip — surprise me
          </button>
        </>
      )}

      {/* Sensation step */}
      {step === 'sensation' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {getOptionsWithCounts(currentPool, 'sensation', SENSATION_OPTIONS).map(({ value, count }) => (
              <button
                key={value}
                onClick={() => select('sensation', value)}
                disabled={count === 0}
                className="px-4 py-3 rounded-lg border border-charcoal-lighter text-sm font-sans tracking-wider capitalize text-cream hover:border-gold/50 hover:text-gold active:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {value}
                <span className="block text-[10px] text-cream-dim mt-0.5">{count} cocktails</span>
              </button>
            ))}
          </div>
          <button onClick={() => select('sensation', '')} className="w-full mt-3 text-cream-dim text-xs underline">
            Skip this step
          </button>
        </>
      )}

      {/* Style step */}
      {step === 'style' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {getOptionsWithCounts(poolAfterSensation, 'style', STYLE_OPTIONS).map(({ value, count }) => (
              <button
                key={value}
                onClick={() => select('style', value)}
                disabled={count === 0}
                className="px-4 py-3 rounded-lg border border-charcoal-lighter text-sm font-sans tracking-wider capitalize text-cream hover:border-gold/50 hover:text-gold active:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {value}
                <span className="block text-[10px] text-cream-dim mt-0.5">{count} cocktails</span>
              </button>
            ))}
          </div>
          <button onClick={() => select('style', '')} className="w-full mt-3 text-cream-dim text-xs underline">
            Skip this step
          </button>
        </>
      )}

      {/* Strength step */}
      {step === 'strength' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {getStrengthCounts(poolAfterStyle).map(({ value, count }) => (
              <button
                key={value}
                onClick={() => select('strength', value)}
                disabled={count === 0}
                className="px-4 py-3 rounded-lg border border-charcoal-lighter text-sm font-sans tracking-wider capitalize text-cream hover:border-gold/50 hover:text-gold active:bg-gold/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {value}
                <span className="block text-[10px] text-cream-dim mt-0.5">{count}</span>
              </button>
            ))}
          </div>
          <button onClick={() => select('strength', '')} className="w-full mt-3 text-cream-dim text-xs underline">
            Skip this step
          </button>
        </>
      )}

      {/* Results */}
      {step === 'results' && (
        <div>
          <p className="text-cream-dim text-xs text-center mb-4 font-sans tracking-wider">
            {finalPool.length} {finalPool.length === 1 ? 'match' : 'matches'}
          </p>
          {finalPool.length === 0 ? (
            <p className="text-cream-dim text-center text-sm">No matches — try different options.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {finalPool.slice(0, 20).map((c) => {
                const imgFile = imgMap[c.imageId]
                const imgSrc = imgFile ? `/images/cocktails/${imgFile}` : null
                return (
                  <Link
                    key={c.id}
                    to={`/cocktail/${c.slug}`}
                    className="rounded-lg overflow-hidden bg-charcoal-light border border-charcoal-lighter/50 active:bg-charcoal-lighter/30 transition-colors"
                  >
                    <div className="aspect-square bg-charcoal-lighter">
                      {imgSrc && (
                        <img src={imgSrc} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="px-2 py-2">
                      <p className="text-cream text-xs font-sans tracking-wide truncate">{c.name}</p>
                      <p className="text-cream-dim text-[10px] truncate">{c.ingredientsText}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          {finalPool.length > 20 && (
            <p className="text-cream-dim text-xs text-center mt-4">
              Showing 20 of {finalPool.length} — narrow your choices for fewer results.
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {stepIndex > 0 ? (
          <button onClick={goBack} className="text-cream-dim text-sm hover:text-cream transition-colors">
            Back
          </button>
        ) : (
          <div />
        )}
        <button onClick={startOver} className="text-gold text-sm hover:text-gold/80 transition-colors">
          Start Over
        </button>
      </div>
    </div>
  )
}
