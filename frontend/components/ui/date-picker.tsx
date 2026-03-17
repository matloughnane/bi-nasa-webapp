import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Calendar } from "./calendar"

export function DatePicker({
  label,
  date,
  onSelect,
  disabledBefore,
  disabledAfter,
}: {
  label: string
  date: Date
  onSelect: (date: Date) => void
  disabledBefore?: Date
  disabledAfter?: Date
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => {
            if (day) {
              onSelect(day)
              setOpen(false)
            }
          }}
          disabled={[
            ...(disabledBefore ? [{ before: disabledBefore }] : []),
            ...(disabledAfter ? [{ after: disabledAfter }] : []),
          ]}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
