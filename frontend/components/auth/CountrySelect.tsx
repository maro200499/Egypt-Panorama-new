"use client"

import { getNationalityFlag, type NationalityOption } from "@/lib/userProfile"
import { useEffect, useMemo, useRef, useState } from "react"

type CountrySelectProps = {
  value: string
  onChange: (value: string) => void
  options: NationalityOption[]
  locale: "en" | "ar"
  placeholder: string
  searchPlaceholder: string
  emptyLabel: string
}

export default function CountrySelect({
  value,
  onChange,
  options,
  locale,
  placeholder,
  searchPlaceholder,
  emptyLabel,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return options
    }

    return options.filter((option) => {
      const haystack = [option.en, option.ar, option.value].join(" ").toLowerCase()
      return haystack.includes(query)
    })
  }, [options, search])

  useEffect(() => {
    optionRefs.current = []
  }, [filteredOptions])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const timeoutId = window.setTimeout(() => searchInputRef.current?.focus(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) {
      return
    }

    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex, isOpen])

  function commitSelection(nextValue: string) {
    onChange(nextValue)
    closeDropdown()
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  function getDefaultHighlightIndex(nextOptions = filteredOptions) {
    const selectedIndex = nextOptions.findIndex((option) => option.value === value)
    return selectedIndex >= 0 ? selectedIndex : nextOptions.length > 0 ? 0 : -1
  }

  function openDropdown() {
    setHighlightedIndex(getDefaultHighlightIndex())
    setIsOpen(true)
  }

  function closeDropdown() {
    setIsOpen(false)
    setSearch("")
    setHighlightedIndex(-1)
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  function moveHighlight(direction: 1 | -1) {
    if (filteredOptions.length === 0) {
      return
    }

    setHighlightedIndex((current) => {
      if (current < 0) {
        return direction === 1 ? 0 : filteredOptions.length - 1
      }

      return (current + direction + filteredOptions.length) % filteredOptions.length
    })
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openDropdown()
    }
  }

  function handleSearchChange(nextSearch: string) {
    const normalizedSearch = nextSearch.trim().toLowerCase()
    const nextOptions = !normalizedSearch
      ? options
      : options.filter((option) => {
          const haystack = [option.en, option.ar, option.value].join(" ").toLowerCase()
          return haystack.includes(normalizedSearch)
        })

    setSearch(nextSearch)
    setHighlightedIndex(getDefaultHighlightIndex(nextOptions))
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      moveHighlight(1)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      moveHighlight(-1)
      return
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault()
      commitSelection(filteredOptions[highlightedIndex].value)
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      closeDropdown()
      window.setTimeout(() => triggerRef.current?.focus(), 0)
    }
  }

  const selectedLabel = selectedOption
    ? `${getNationalityFlag(selectedOption.value)} ${locale === "ar" ? selectedOption.ar : selectedOption.en}`.trim()
    : placeholder

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name="nationality" value={value} />

      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            closeDropdown()
            return
          }

          openDropdown()
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-start outline-none transition ${
          isOpen
            ? "border-amber-300 bg-black/35 ring-2 ring-amber-300/35"
            : "border-amber-200/30 bg-black/25"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="country-select-listbox"
      >
        <span className={selectedOption ? "text-amber-50" : "text-amber-100/45"}>{selectedLabel}</span>
        <span className={`text-xs text-amber-200 transition ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-amber-200/20 bg-slate-950/95 shadow-[0_22px_60px_-30px_rgba(251,146,60,0.75)] backdrop-blur-xl">
          <div className="border-b border-white/10 p-3">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-amber-200/20 bg-white/5 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-100/35 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/25"
            />
          </div>

          <div ref={listRef} className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              <ul id="country-select-listbox" className="space-y-1" role="listbox">
                {filteredOptions.map((option, index) => {
                  const isSelected = option.value === value
                  const isHighlighted = index === highlightedIndex
                  const label = locale === "ar" ? option.ar : option.en

                  return (
                    <li key={option.value}>
                      <button
                        ref={(element) => {
                          optionRefs.current[index] = element
                        }}
                        type="button"
                        onClick={() => commitSelection(option.value)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-start transition ${
                          isSelected || isHighlighted
                            ? "bg-amber-300/15 text-amber-100"
                            : "text-amber-50 hover:bg-white/6"
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="flex items-center gap-3 overflow-hidden">
                          <span className="text-lg leading-none">{getNationalityFlag(option.value)}</span>
                          <span className="truncate text-sm">{label}</span>
                        </span>
                        {isSelected && <span className="text-xs text-amber-300">✓</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="px-3 py-5 text-center text-sm text-amber-100/55">{emptyLabel}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}