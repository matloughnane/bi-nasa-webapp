"use client"

import {
  Axis,
  BarSeries,
  BarStack,
  Grid,
  Tooltip,
  XYChart,
} from "@visx/xychart"

export interface DateCount {
  date: string
  count: number
}

interface NeoChartProps {
  safeCounts: DateCount[]
  hazardousCounts: DateCount[]
}

export function NeoChart({ safeCounts, hazardousCounts }: NeoChartProps) {
  return (
    <>
      <div className="mb-2 rounded-xs border p-4">
        <div className="flex flex-row justify-between">
          <h2 className="mb-2 text-sm font-semibold">
            Objects by Approach Date
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5"
                style={{ backgroundColor: "var(--color-chart-3)" }}
              />
              Safe
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5"
                style={{ backgroundColor: "var(--color-chart-1)" }}
              />
              Hazardous
            </span>
          </div>
        </div>
        <XYChart
          height={320}
          xScale={{ type: "band", paddingInner: 0.3, paddingOuter: 0.2 }}
          yScale={{ type: "linear", nice: true, round: true }}
          margin={{ top: 16, right: 16, bottom: 48, left: 48 }}
        >
          <Grid
            columns={false}
            numTicks={5}
            lineStyle={{ stroke: "var(--color-muted)", strokeDasharray: "2,3" }}
          />
          <Axis
            orientation="bottom"
            label="Approach Date"
            tickLabelProps={{
              fontSize: 11,
              fill: "var(--color-muted-foreground)",
              fontFamily: "var(--font-mono)",
            }}
            labelProps={{
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fill: "var(--color-muted-foreground)",
            }}
            stroke="none"
            tickStroke="none"
            />
          <Axis
            orientation="left"
            label="Count"
            numTicks={5}
            tickLabelProps={{
              fontSize: 11,
              fill: "var(--color-muted-foreground)",
              fontFamily: "var(--font-mono)",
            }}
            labelProps={{
              fontSize: 12,
              dx: -18,
              fontFamily: "var(--font-mono)",
              fill: "var(--color-muted-foreground)",
            }}
            stroke="none"
          />
          <BarStack>
            <BarSeries
              dataKey="Safe"
              data={safeCounts}
              xAccessor={(d: DateCount) => d?.date ?? ""}
              yAccessor={(d: DateCount) => d?.count ?? 0}
              colorAccessor={() => "var(--color-chart-3)"}
            />
            <BarSeries
              dataKey="Hazardous"
              data={hazardousCounts}
              xAccessor={(d: DateCount) => d?.date ?? ""}
              yAccessor={(d: DateCount) => d?.count ?? 0}
              colorAccessor={() => "var(--color-chart-1)"}
            />
          </BarStack>
          <Tooltip
            renderTooltip={({ tooltipData }) => {
              const key = tooltipData?.nearestDatum?.key
              const datum = tooltipData?.nearestDatum?.datum as
                | DateCount
                | undefined
              if (!datum) return null
              return (
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <p style={{ fontWeight: 600 }}>{datum.date}</p>
                  <p>
                    {key}: {datum.count}
                  </p>
                </div>
              )
            }}
          />
        </XYChart>
      </div>
      {/* <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre> */}
    </>
  )
}
