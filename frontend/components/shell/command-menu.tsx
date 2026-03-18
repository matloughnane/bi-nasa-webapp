"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Earth, Home, Info, Moon, Sun, SunMedium } from "lucide-react"

import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"

const pages = [
  { label: "Home", href: "/", icon: Home },
  { label: "Near Earth Objects", href: "/near-earth-objects", icon: Earth },
  { label: "Solar Flares", href: "/solar-flares", icon: SunMedium },
  { label: "About", href: "/about", icon: Info },
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    setOpen(false)
  }, [resolvedTheme, setTheme])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map(({ label, href, icon: Icon }) => (
              <CommandItem key={href} onSelect={() => navigate(href)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Theme">
            <CommandItem onSelect={toggleTheme}>
              {resolvedTheme === "dark" ? <Sun /> : <Moon />}
              Toggle {resolvedTheme === "dark" ? "light" : "dark"} mode
              <CommandShortcut>D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
