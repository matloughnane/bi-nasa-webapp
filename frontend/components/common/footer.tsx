import { Logo } from "./logo"

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
              <a
                href="https://api.nasa.gov/"
                aria-label="NASA Open API"
                target="_blank"
              >
                Open APIs
              </a>
              <a href="/about" aria-label="About The Project">
                About This Project
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Matthew Loughnane</h4>
              <a
                href="https://matloughnane.com/assets/cv/mat-loughnane-cv.pdf"
                aria-label="Matthew Loughnane's CV"
                target="_blank"
              >
                My CV
              </a>
              <a
                href="https://hexastudios.co"
                aria-label="Hexa Studios Link"
                target="_blank"
              >
                My Work
              </a>
            </div>
          </div>
          <div className="pt-6 font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </div>
    </footer>
  )
}
