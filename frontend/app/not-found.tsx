import Link from "next/link"
import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Link href="/">
        <Logo />
      </Link>
      <p className="text-sm text-muted-foreground">
        404 — Page not found
      </p>
      <Link href="/">
        <Button size="lg" variant="default">
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
