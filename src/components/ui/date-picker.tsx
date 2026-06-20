import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerInputProps {
  value: string // ISO date string "YYYY-MM-DD" or ""
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)

  const selected = value ? parseISO(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 justify-start gap-2 rounded-pill border-mathe-border bg-mathe-white text-sm font-normal text-mathe-ink hover:bg-mathe-surface",
            !value && "text-mathe-muted",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-mathe-muted" />
          <span className="flex-1 text-left">
            {selected ? format(selected, "d MMM yyyy", { locale: es }) : placeholder}
          </span>
          {value && (
            <span
              role="button"
              aria-label="Limpiar fecha"
              className="ml-auto grid size-5 place-items-center rounded-full hover:bg-mathe-border"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
                setOpen(false)
              }}
            >
              <X className="size-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            onChange(day ? format(day, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
