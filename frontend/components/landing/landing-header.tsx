import { Logo } from "../common/logo"

interface LandingHeaderProps {
  title: string
}

export function LandingHeader({ title }: LandingHeaderProps) {
  return (
    <>
      <div className="max-w-80 py-8">
        <Logo />
      </div>
      <h1 className="py-4 text-center text-2xl font-semibold">{title}</h1>
    </>
  )
}
