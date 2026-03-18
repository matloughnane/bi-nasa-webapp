"use client"

import { useMemo, useState } from "react"
import { CustomProjection, Graticule } from "@visx/geo"
import { ParentSize } from "@visx/responsive"
import { Zoom } from "@visx/zoom"
import { geoConicConformal } from "d3-geo"
import type { FlrEvent } from "@/lib/services/flr"
import { Button } from "../ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

interface FlrChartProps {
  data: FlrEvent[]
}

interface FlarePoint {
  event: FlrEvent
  lat: number
  lon: number
}

interface BoundingFeature {
  type: "Feature"
  geometry: { type: "Polygon"; coordinates: [number, number][][] }
  properties: Record<string, never>
}

const CLASS_COLORS: Record<string, string> = {
  M: "var(--color-chart-1)",
  X: "var(--color-chart-2)",
  C: "var(--color-chart-3)",
  B: "var(--color-chart-4)",
  A: "var(--color-chart-5)",
}

function getClassColor(classType: string): string {
  const scale = classType.charAt(0).toUpperCase()
  return CLASS_COLORS[scale] ?? "var(--color-muted-foreground)"
}

function parseSourceLocation(loc: string): { lat: number; lon: number } | null {
  if (!loc || !loc.trim()) return null
  const match = loc.trim().match(/([NS])\s*(\d+)\s*([EW])\s*(\d+)/i)
  if (!match) return null
  const lat = parseInt(match[2], 10) * (match[1].toUpperCase() === "N" ? 1 : -1)
  const lon = parseInt(match[4], 10) * (match[3].toUpperCase() === "E" ? 1 : -1)
  return { lat, lon }
}

const ASPECT_RATIO_DESKTOP = 260 / 800
const ASPECT_RATIO_MOBILE = 320 / 800

const boundingFeatures: BoundingFeature[] = [
  {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-90, -90],
          [90, -90],
          [90, 90],
          [-90, 90],
          [-90, -90],
        ],
      ],
    },
    properties: {},
  },
]

export function FlrChart({ data }: FlrChartProps) {
  const isMobile = useIsMobile()
  const aspectRatio = isMobile ? ASPECT_RATIO_MOBILE : ASPECT_RATIO_DESKTOP

  return (
    <div className="rounded-xs border p-4">
      <div className="flex flex-row items-start justify-between">
        <h2 className="mb-2 text-sm font-semibold">
          Solar Flare Source Locations
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {Object.entries(CLASS_COLORS).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
      <ParentSize>
        {({ width: parentWidth }) => {
          if (parentWidth < 10) return null
          const height = Math.round(parentWidth * aspectRatio)
          return (
            <FlrChartInner data={data} width={parentWidth} height={height} />
          )
        }}
      </ParentSize>
    </div>
  )
}

function FlrChartInner({
  data,
  width,
  height,
}: {
  data: FlrEvent[]
  width: number
  height: number
}) {
  const [hovered, setHovered] = useState<FlarePoint | null>(null)
  const centerX = width / 2
  const centerY = height / 2
  const initialScale = (width / 630) * 100

  const points = useMemo(() => {
    const result: FlarePoint[] = []
    const seen = new Map<string, number>()
    for (const event of data) {
      const coords = parseSourceLocation(event.source_location)
      if (coords) {
        const key = `${coords.lat},${coords.lon}`
        const count = seen.get(key) ?? 0
        seen.set(key, count + 1)
        const angle = count * 2.4
        const radius = count * 2
        result.push({
          event,
          lat: coords.lat + Math.sin(angle) * radius,
          lon: coords.lon + Math.cos(angle) * radius,
        })
      }
    }
    return result
  }, [data])

  return (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
      scaleXMin={50}
      scaleXMax={1000}
      scaleYMin={50}
      scaleYMax={1000}
      initialTransformMatrix={{
        scaleX: initialScale,
        scaleY: initialScale,
        translateX: centerX,
        translateY: centerY,
        skewX: 0,
        skewY: 0,
      }}
    >
      {(zoom) => (
        <div className="relative">
          <svg
            width={width}
            height={height}
            className={zoom.isDragging ? "cursor-grabbing" : "cursor-grab"}
            ref={zoom.containerRef}
            style={{ touchAction: "none" }}
            onTouchStart={zoom.dragStart}
            onTouchMove={zoom.dragMove}
            onTouchEnd={zoom.dragEnd}
            onMouseDown={zoom.dragStart}
            onMouseMove={zoom.dragMove}
            onMouseUp={zoom.dragEnd}
            onMouseLeave={() => {
              if (zoom.isDragging) zoom.dragEnd()
            }}
          >
            <rect
              width={width}
              height={height}
              fill="var(--color-muted)"
              fillOpacity={0.15}
              rx={4}
            />
            <CustomProjection<BoundingFeature>
              projection={geoConicConformal}
              data={boundingFeatures}
              scale={zoom.transformMatrix.scaleX}
              translate={[
                zoom.transformMatrix.translateX,
                zoom.transformMatrix.translateY,
              ]}
            >
              {(customProjection) => (
                <g>
                  <Graticule
                    graticule={(g) => customProjection.path(g) || ""}
                    stroke="var(--color-ring)"
                    strokeWidth={0.5}
                    strokeOpacity={0.4}
                  />

                  {customProjection.features.map(({ path }, i) => (
                    <path
                      key={`bound-${i}`}
                      d={path || ""}
                      fill="none"
                      stroke="var(--color-ring)"
                      strokeWidth={1}
                      strokeOpacity={0.3}
                    />
                  ))}

                  {points.map((point, i) => {
                    const projected = customProjection.projection([
                      point.lon,
                      point.lat,
                    ])
                    if (!projected) return null
                    const [x, y] = projected
                    if (isNaN(x) || isNaN(y)) return null
                    const isHovered = hovered === point
                    return (
                      <circle
                        key={`${point.event.id}-${i}`}
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 4}
                        fill={getClassColor(point.event.class_type)}
                        fillOpacity={isHovered ? 1 : 0.7}
                        stroke={isHovered ? "var(--color-foreground)" : "none"}
                        strokeWidth={1.5}
                        onMouseEnter={() => setHovered(point)}
                        onMouseLeave={() => setHovered(null)}
                        className="cursor-pointer transition-all"
                      />
                    )
                  })}

                  {hovered &&
                    (() => {
                      const projected = customProjection.projection([
                        hovered.lon,
                        hovered.lat,
                      ])
                      if (!projected) return null
                      const [x, y] = projected
                      if (isNaN(x) || isNaN(y)) return null
                      const tooltipX = x + 12
                      const tooltipY = y - 12
                      return (
                        <g>
                          <rect
                            x={tooltipX}
                            y={tooltipY - 12}
                            width={150}
                            height={56}
                            rx={4}
                            fill="var(--color-popover)"
                            stroke="var(--color-border)"
                            strokeWidth={1}
                          />
                          <text
                            x={tooltipX + 8}
                            y={tooltipY + 2}
                            fontSize={11}
                            fontWeight={600}
                            fill="var(--color-popover-foreground)"
                          >
                            {hovered.event.class_type}
                          </text>
                          <text
                            x={tooltipX + 8}
                            y={tooltipY + 16}
                            fontSize={10}
                            fill="var(--color-muted-foreground)"
                          >
                            Location: {hovered.event.source_location}
                          </text>
                          <text
                            x={tooltipX + 8}
                            y={tooltipY + 30}
                            fontSize={10}
                            fill="var(--color-muted-foreground)"
                          >
                            Peak:{" "}
                            {new Date(
                              hovered.event.peak_time
                            ).toLocaleDateString()}
                          </text>
                        </g>
                      )
                    })()}
                </g>
              )}
            </CustomProjection>
          </svg>

          <div className="absolute right-3 bottom-3 flex flex-col items-end gap-1">
            <Button
              onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
              size={"icon"}
              variant={"outline"}
            >
              +
            </Button>
            <Button
              onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
              size={"icon"}
              variant={"outline"}
            >
              −
            </Button>
            <Button onClick={zoom.reset} variant={"outline"}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </Zoom>
  )
}
