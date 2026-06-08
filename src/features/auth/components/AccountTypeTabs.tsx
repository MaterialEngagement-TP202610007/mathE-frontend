import { cn } from "@/lib/utils"
import { ACCOUNT_TABS, type AccountType } from "../types/account-type"

interface AccountTypeTabsProps {
  value: AccountType
  onChange: (value: AccountType) => void
}

/** Segmented pill toggle between the Estudiante / Profesor account types. */
export function AccountTypeTabs({ value, onChange }: AccountTypeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Tipo de cuenta"
      className="grid grid-cols-2 gap-1 rounded-pill bg-mathe-blue/5 p-1"
    >
      {ACCOUNT_TABS.map(({ value: tab, label, icon: Icon }) => {
        const active = value === tab
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-pill text-sm font-semibold transition",
              active
                ? "bg-mathe-blue text-mathe-white shadow-sm"
                : "text-mathe-muted hover:text-mathe-ink",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
