import { Loader2 } from "lucide-react"

interface DashboardHeaderProps {
  isLoading: boolean
  title: string
  description: string
  actions: React.ReactNode
}

export function DashboardHeader({
  isLoading,
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <>
      <div className="flex flex-col items-start justify-between lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col w-full pt-2">
          <div className="flex flex-row justify-end items-center gap-2">
            {isLoading && (
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            )}
            {actions}
          </div>
        </div>
      </div>
    </>
  )
}
