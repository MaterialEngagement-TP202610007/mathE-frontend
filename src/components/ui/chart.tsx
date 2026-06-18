import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { Payload } from "recharts/types/component/DefaultTooltipContent"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = { config: ChartConfig }

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

// Injects --color-<key> CSS variables scoped to data-chart attribute.
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, v]) => v.color)
  if (!entries.length) return null
  const vars = entries.map(([key, v]) => `  --color-${key}: ${v.color};`).join("\n")
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${vars}\n}`,
      }}
    />
  )
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactElement
}) {
  const uid = React.useId()
  const chartId = `chart-${id ?? uid.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex justify-center text-xs",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({
  active,
  payload,
  hideLabel = false,
  className,
}: React.ComponentProps<"div"> & {
  active?: boolean
  payload?: Payload<number, string>[]
  hideLabel?: boolean
}) {
  const { config } = useChart()
  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-mathe-border bg-mathe-white px-3 py-2 shadow-md text-xs",
        className,
      )}
    >
      {payload.map((item: Payload<number, string>) => {
        const key = (item.dataKey as string) || (item.name as string) || ""
        const label = config[key]?.label ?? item.name ?? key
        const rawPayload = item.payload as Record<string, unknown> | undefined
        const color = (rawPayload?.fill as string | undefined) ?? item.color ?? config[key]?.color
        return (
          <div key={key} className="flex items-center gap-2">
            {!hideLabel && color && (
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
            )}
            <span className="text-mathe-muted">{label as React.ReactNode}</span>
            <span className="ml-auto font-semibold text-mathe-ink tabular-nums">
              {item.value}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
