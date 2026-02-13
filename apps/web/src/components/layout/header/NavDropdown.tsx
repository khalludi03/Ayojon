import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  href: string
  label: string
  description?: string
}

interface NavDropdownProps {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  items: Array<DropdownItem>
  highlight?: boolean
  className?: string
}

export function NavDropdown({
  label,
  icon: Icon,
  items,
  highlight,
  className,
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])

  // Check if current route matches any dropdown items
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const isActive = items.some((item) => currentPath.startsWith(item.href))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setActiveIndex(-1)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          event.key === 'Enter' ||
          event.key === ' ' ||
          event.key === 'ArrowDown'
        ) {
          event.preventDefault()
          setIsOpen(true)
          setActiveIndex(0)
        }
        return
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          event.preventDefault()
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
          break
        case 'Tab':
          setIsOpen(false)
          setActiveIndex(-1)
          break
        case 'Enter':
          if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
            itemRefs.current[activeIndex]?.click()
          }
          break
      }
    },
    [isOpen, items.length, activeIndex],
  )

  // Focus active item
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.focus()
    }
  }, [activeIndex])

  // Handle hover for desktop
  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // Handle click for mobile
  const handleClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-[hsl(var(--card))] hover:shadow-sm',
          isOpen && 'bg-[hsl(var(--card))] shadow-sm',
          isActive &&
            'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90',
          highlight && !isActive
            ? 'text-[hsl(var(--accent))] font-semibold'
            : !isActive && 'text-[hsl(var(--foreground))]',
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 ml-0.5 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        role="menu"
        aria-orientation="vertical"
        className={cn(
          'absolute left-0 top-full z-50 mt-1 min-w-[200px] origin-top-left',
          'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg',
          'transition-all duration-200 ease-out',
          isOpen
            ? 'visible scale-100 opacity-100 translate-y-0'
            : 'invisible scale-95 opacity-0 -translate-y-2',
        )}
      >
        <div className="py-2">
          {items.map((item, index) => (
            <Link
              key={item.href}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              to={item.href}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                setIsOpen(false)
                setActiveIndex(-1)
              }}
              className={cn(
                'block px-4 py-2.5 text-sm transition-colors duration-150',
                'hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))] focus:outline-none',
                activeIndex === index && 'bg-[hsl(var(--muted))]',
                currentPath === item.href &&
                  'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-semibold',
              )}
            >
              <span className="font-medium text-[hsl(var(--foreground))]">
                {item.label}
              </span>
              {item.description && (
                <span className="block text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NavDropdown
