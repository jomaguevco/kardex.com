'use client'

import { ReactNode } from 'react'

interface TableWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * Wrapper component for tables that ensures horizontal scrolling works correctly
 * even when tables exceed the viewport width. This component handles:
 * - Proper overflow-x-auto with visible scrollbar
 * - Negative margins to extend scroll area to card edges
 * - Minimum width constraints
 */
export default function TableWrapper({ children, className = '' }: TableWrapperProps) {
  return (
    <div className={`table-scroll-wrapper ${className}`}>
      {children}
    </div>
  )
}

