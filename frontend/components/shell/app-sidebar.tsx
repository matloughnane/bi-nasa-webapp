"use client"

import * as React from "react"

import { NavMain } from "@/components/shell/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BookOpen, ChevronLeftCircle, Computer, Earth, Settings, Sun } from "lucide-react"
import { Logo } from "../common/logo"
import Link from "next/link"

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
      icon: <Sun />,
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
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="h-6 w-32">
                  <Logo />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Link
          href={"/"}
          className="flex flex-row justify-center items-center text-sm"
        >
          <ChevronLeftCircle className="mr-2 h-4 w-4" /> Back to Landing
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
