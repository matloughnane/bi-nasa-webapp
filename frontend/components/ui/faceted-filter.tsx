"use client"

import { Check, PlusCircle, XCircle } from "lucide-react"
import React, { useState, useCallback } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface FacetedFilterOption {
  label: string
  value: string
  count?: number
}

interface FacetedFilterProps {
  title: string
  options: FacetedFilterOption[]
  value: Set<string>
  onValueChange: (value: Set<string>) => void
}

export function FacetedFilter({
  title,
  options,
  value,
  onValueChange,
}: FacetedFilterProps) {
  const [open, setOpen] = useState(false)

  const onItemSelect = useCallback(
    (option: FacetedFilterOption, isSelected: boolean) => {
      const next = new Set(value)
      if (isSelected) {
        next.delete(option.value)
      } else {
        next.add(option.value)
      }
      onValueChange(next)
    },
    [value, onValueChange]
  )

  const onReset = useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation()
      onValueChange(new Set())
    },
    [onValueChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // size="md"
          className="border-dashed font-normal"
        >
          {value.size > 0 ? (
            <div
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              onClick={onReset}
            >
              <XCircle />
            </div>
          ) : (
            <PlusCircle />
          )}
          {title}
          {value.size > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mx-0.5 data-[orientation=vertical]:h-4"
              />
              <div className="flex items-center gap-1">
                {value.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {value.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => value.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="default"
                        key={option.value}
                        className="rounded-none px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto">
              {options.map((option) => {
                const isSelected = value.has(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onItemSelect(option, isSelected)}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="text-white" />
                    </div>
                    <span className="truncate flex-1">{option.label}</span>
                    {option.count != null && (
                      <span className="font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onReset()}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
