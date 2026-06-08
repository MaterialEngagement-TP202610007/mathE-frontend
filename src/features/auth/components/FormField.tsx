import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends ComponentProps<"input"> {
  label: string
  name: string
  error?: string
}

export function FormField({ label, name, error, className, ...props }: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn("h-11 rounded-pill px-4", className)}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
