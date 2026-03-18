"use client"

import { useState } from "react"
import axios from "axios"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ApiResponse } from "@/lib/services/api"
import { MarkdownWrapper } from "../common/react-wrapper"

interface AiSummaryProps {
  type: "neo" | "flr"
  startDate: string
  endDate: string
}

export function AiSummary({ type, startDate, endDate }: AiSummaryProps) {
  const [question, setQuestion] = useState("")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    const q = question.trim() || undefined
    setQuestion("")
    setIsLoading(true)
    setOutput("")

    try {
      const { data } = await axios.post<ApiResponse<{ summary: string }>>(
        `/api/summary/${type}`,
        { start_date: startDate, end_date: endDate, question: q }
      )
      setOutput(data.data?.summary ?? "")
    } catch {
      setOutput("Failed to generate summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="py-0">
      {(isLoading || output) && (
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Thinking...
            </div>
          ) : (
            <MarkdownWrapper>{output}</MarkdownWrapper>
          )}
        </CardContent>
      )}
      <CardFooter className="gap-2 flex flex-col md:flex-row items-end">
        <Input
          placeholder="Ask a question about this data..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) handleSubmit()
          }}
          disabled={isLoading}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Sparkles className="mr-1 h-1 w-1" />
              {question.trim() ? "Ask" : "Summarise data"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
