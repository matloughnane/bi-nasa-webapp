"use client"

import * as React from "react"

import { NavMain } from "@/components/shell/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronLeftCircle, Earth, Info, Sun as SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "../common/logo"
import Link from "next/link"
import { ThemeToggle } from "../common/theme-toggle"

const data = {
  navMain: [
    {
      title: "Near Earth Objects",
      url: "/near-earth-objects",
      icon: <Earth />,
    },
    {
      title: "Solar Flares",
      url: "/solar-flares",
      icon: <SunIcon />,
    },
    {
      title: "About",
      url: "/about",
      icon: <Info />,
    },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: <Settings />,
    // },
  ],
  navSecondary: [],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton size="lg" asChild> */}
            <Link href="/">
              <div className="my-2 block h-6 w-32">
                <Logo />
              </div>
            </Link>
            {/* </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ChevronLeftCircle className="mr-2 h-4 w-4" /> Back to Landing
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
