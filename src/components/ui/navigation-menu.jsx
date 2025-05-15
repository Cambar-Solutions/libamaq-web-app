"use client"
import * as React from "react"
import * as RadixNav from "@radix-ui/react-navigation-menu"
import { cn } from "@/lib/utils" // ajusta si tu util de `cn` está en otra ruta

export const NavigationMenu = ({ children, className, ...props }) => (
  <RadixNav.Root className={cn("relative z-20", className)} {...props}>
    {children}
  </RadixNav.Root>
)

export const NavigationMenuList = React.forwardRef(({ children, className, ...props }, ref) => (
  <RadixNav.List
    ref={ref}
    className={cn(
      "m-0 flex list-none p-1",
      className
    )}
    {...props}
  >
    {children}
  </RadixNav.List>
))
NavigationMenuList.displayName = "NavigationMenuList"

export const NavigationMenuItem = RadixNav.Item

export const NavigationMenuTrigger = React.forwardRef(({ children, className, ...props }, ref) => (
  <RadixNav.Trigger
    ref={ref}
    className={cn(
      "text-base font-bold text-white hover:underline focus:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </RadixNav.Trigger>
))
NavigationMenuTrigger.displayName = "NavigationMenuTrigger"

export const NavigationMenuContent = React.forwardRef(({ children, className, ...props }, ref) => (
  <RadixNav.Content
    ref={ref}
    className={cn(
      // Estilos aplicados al panel flotante
      "absolute top-full right-0 left-auto animate-in fade-in-80 z-50 grid bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl " +
      "md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]",
      className
    )}
    {...props}
  >
    {children}
  </RadixNav.Content>
))
NavigationMenuContent.displayName = "NavigationMenuContent"

export const NavigationMenuLink = React.forwardRef(({ children, className, ...props }, ref) => (
  <RadixNav.Link
    ref={ref}
    className={cn(
      "block rounded-md px-3 py-2 text-sm font-medium leading-none no-underline outline-none focus:shadow-md",
      "hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </RadixNav.Link>
))
NavigationMenuLink.displayName = "NavigationMenuLink"
