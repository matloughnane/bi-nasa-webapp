"use client"

import { Axis, GlyphSeries, Grid, Tooltip, XYChart } from "@visx/xychart"
import type { NeoObject } from "@/lib/services/neo"

interface NeoChartProps {
  data: NeoObject[]
}

const accessors = {
  xAccessor: (d: NeoObject) => d?.miss_distance_km ?? 0,
  yAccessor: (d: NeoObject) => d?.relative_velocity_kmph ?? 0,
  sizeAccessor: (d: NeoObject) => {
    if (!d) return 4
    const avg = (d.estimated_diameter_min_km + d.estimated_diameter_max_km) / 2
    return Math.max(4, Math.min(avg * 40, 24))
  },
}

function formatKm(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toFixed(0)
}

export function NeoChart({ data }: NeoChartProps) {
  const hazardous = data.filter((d) => d.is_potentially_hazardous)
  const safe = data.filter((d) => !d.is_potentially_hazardous)

  return (
    <div className="rounded-xs mb-8 border p-4">
      <h2 className="mb-2 text-sm font-semibold">
        Miss Distance vs Relative Velocity
      </h2>
      <XYChart
        height={360}
        xScale={{ type: "linear", nice: true }}
        yScale={{ type: "linear", nice: true }}
        margin={{ top: 16, right: 16, bottom: 48, left: 64 }}
      >
        <Grid
          columns={false}
          numTicks={5}
          lineStyle={{ stroke: "var(--color-muted)", strokeDasharray: "2,3" }}
        />
        <Axis
          orientation="bottom"
          label="Miss Distance (km)"
          numTicks={5}
          tickFormat={(v) => formatKm(v as number)}
          labelProps={{ fontSize: 12 }}
          tickLabelProps={{ fontSize: 11 }}
        />
        <Axis
          orientation="left"
          label="Velocity (km/h)"
          numTicks={5}
          tickFormat={(v) => formatKm(v as number)}
          labelProps={{ fontSize: 12 }}
          tickLabelProps={{ fontSize: 11 }}
        />
        <GlyphSeries
          dataKey="Safe"
          data={safe}
          {...accessors}
          colorAccessor={() => "var(--color-primary)"}
          renderGlyph={({ x, y, size, color }) => (
            <circle
              cx={x}
              cy={y}
              r={size / 2}
              fill={color}
              fillOpacity={0.6}
              stroke={color}
              strokeWidth={1}
            />
          )}
        />
        <GlyphSeries
          dataKey="Hazardous"
          data={hazardous}
          {...accessors}
          colorAccessor={() => "var(--color-destructive)"}
          renderGlyph={({ x, y, size, color }) => (
            <circle
              cx={x}
              cy={y}
              r={size / 2}
              fill={color}
              fillOpacity={0.6}
              stroke={color}
              strokeWidth={1}
            />
          )}
        />
        <Tooltip
          snapTooltipToDatumX
          snapTooltipToDatumY
          showSeriesGlyphs
          renderTooltip={({ tooltipData }) => {
            const datum = tooltipData?.nearestDatum?.datum as
              | NeoObject
              | undefined
            if (!datum) return null
            return (
              <div className="text-xs">
                <p className="font-semibold">{datum.name}</p>
                <p>Miss: {formatKm(datum.miss_distance_km)} km</p>
                <p>Velocity: {formatKm(datum.relative_velocity_kmph)} km/h</p>
                <p>
                  Diameter: {datum.estimated_diameter_min_km.toFixed(3)}–
                  {datum.estimated_diameter_max_km.toFixed(3)} km
                </p>
                <p>
                  Hazardous: {datum.is_potentially_hazardous ? "Yes" : "No"}
                </p>
              </div>
            )
          }}
        />
      </XYChart>
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
          Safe
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--color-destructive)" }}
          />
          Hazardous
        </span>
        <span className="text-muted-foreground/70">
          Bubble size = estimated diameter
        </span>
      </div>
    </div>
  )
}
