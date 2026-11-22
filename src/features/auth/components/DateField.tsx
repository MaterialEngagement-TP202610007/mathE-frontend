import { useState } from "react"
import { addDays, format, parse, subYears } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  /** Youngest accepted age: later birth dates are disabled in the calendar. */
  minAge?: number
  /** Oldest accepted age: earlier birth dates are disabled in the calendar. */
  maxAge?: number
}

const STORAGE_FORMAT = "yyyy-MM-dd"

function parseValue(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, STORAGE_FORMAT, new Date())
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/** Date picker built on the shadcn Calendar + Popover. */
export function DateField({ label, name, value, onChange, error, minAge, maxAge }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const selected = parseValue(value)
  const today = new Date()
  const latest = minAge === undefined ? today : subYears(today, minAge)
  // Born one day after the date `maxAge + 1` years ago is still `maxAge` years old.
  const earliest = maxAge === undefined ? new Date(1950, 0, 1) : addDays(subYears(today, maxAge + 1), 1)

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={name}
            type="button"
            aria-invalid={Boolean(error)}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-pill border border-mathe-border bg-transparent px-4 text-left text-base outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-invalid:border-destructive",
              !selected && "text-mathe-muted",
            )}
          >
            {selected
              ? format(selected, "PPP", { locale: es })
              : "Selecciona tu fecha"}
            <CalendarIcon className="size-4 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            captionLayout="dropdown"
            startMonth={earliest}
            endMonth={latest}
            defaultMonth={selected ?? latest}
            selected={selected}
            disabled={[{ after: latest }, { before: earliest }]}
            onSelect={(date) => {
              if (date) onChange(format(date, STORAGE_FORMAT))
              setOpen(false)
            }}
            className="w-full"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
