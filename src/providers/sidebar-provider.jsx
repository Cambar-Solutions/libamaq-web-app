import React, { createContext, useContext, useState } from "react"

const SidebarContext = createContext({})

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
