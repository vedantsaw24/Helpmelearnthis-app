'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Award, BrainCircuit, RotateCcw } from 'lucide-react'

import type { Difficulty } from '@/lib/types'
import type { AdaptQuizDifficultyOutput } from '@/ai/flows/adapt-quiz-difficulty'
import { adaptDifficultyAction } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

interface QuizResultsProps {
  score: number
  total: number
  initialDifficulty: Difficulty
  onRestart: () => void
}

export function QuizResults({ score, total, initialDifficulty, onRestart }: QuizResultsProps) {
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<AdaptQuizDifficultyOutput | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const performance = useMemo(() => (total > 0 ? (score / total) * 100 : 0), [score, total])

  const { badge, badgeColor, message } = useMemo(() => {
    if (performance === 100) {
      return { badge: 'Perfect Score!', badgeColor: 'text-yellow-500', message: "Absolutely flawless. You're a true master!" }
    }
    if (performance >= 80) {
      return { badge: 'Top Performer', badgeColor: 'text-green-500', message: 'Outstanding performance. You really know your stuff!' }
    }
    if (performance >= 60) {
      return { badge: 'Impressive Work', badgeColor: 'text-blue-500', message: 'Great job! You have a solid understanding.' }
    }
    return { badge: 'Good Effort', badgeColor: 'text-gray-500', message: "Nice try! Keep practicing to improve." }
  }, [performance])

  useEffect(() => {
    async function getAdaptiveFeedback() {
      setIsLoading(true)
      const result = await adaptDifficultyAction(performance, initialDifficulty)
      if (result.type === 'success' && result.data) {
        setAdaptiveFeedback(result.data)
      } else {
        console.error(result.message)
      }
      setIsLoading(false)
    }
    getAdaptiveFeedback()
  }, [performance, initialDifficulty])

  const chartData = [{ name: 'score', correct: score, incorrect: total - score }]
  const chartConfig = {
    correct: { label: 'Correct', color: 'hsl(var(--primary))' },
    incorrect: { label: 'Incorrect', color: 'hsl(var(--muted))' },
  }

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Award className={`h-10 w-10 ${badgeColor}`} />
        </div>
        <CardTitle className="mt-4 text-2xl font-bold tracking-tight">{badge}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{score}/{total}</p>
            <p className="text-sm text-muted-foreground">Your Score</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{performance.toFixed(0)}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="h-40">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" radius={[4, 4, 4, 4]} />
              <Bar dataKey="incorrect" stackId="a" fill="var(--color-incorrect)" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ChartContainer>
        </div>

        <Card className="bg-background/50">
          <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle className="text-base font-semibold">Adaptive Difficulty Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ) : adaptiveFeedback ? (
              <div>
                <p className="text-sm text-muted-foreground">{adaptiveFeedback.reasoning}</p>
                <p className="mt-2 text-sm">
                  New recommended difficulty: <span className="font-semibold capitalize text-primary">{adaptiveFeedback.newDifficulty}</span>
                </p>
              </div>
            ) : (
                <p className="text-sm text-muted-foreground">Could not load difficulty feedback.</p>
            )}
          </CardContent>
        </Card>

        <Button onClick={onRestart} size="lg" className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Play Again
        </Button>
      </CardContent>
    </Card>
  )
}
