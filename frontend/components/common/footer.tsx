import Link from "next/link"
import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t bg-background py-12 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col justify-between px-2 md:flex-row">
        <div className="max-w-125 pb-8 md:pb-0">
          <a href="/">
            <Logo />
          </a>
        </div>
        <div className="flex flex-col justify-end">
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">NASA</h4>
              <Link href="/" aria-label="About The Project">
                Home
              </Link>
              <Link href="/about" aria-label="About The Project">
                About This Project
              </Link>
              <Link
                href="https://api.nasa.gov/"
                aria-label="NASA Open API"
                target="_blank"
              >
                Open APIs
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Matthew Loughnane</h4>
              <Link
                href="https://matloughnane.com/assets/cv/mat-loughnane-cv.pdf"
                aria-label="Matthew Loughnane's CV"
                target="_blank"
              >
                My CV
              </Link>
              <Link
                href="https://hexastudios.co"
                aria-label="Hexa Studios Link"
                target="_blank"
              >
                My Work
              </Link>
            </div>
          </div>
          <div className="pt-6 flex flex-row justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
