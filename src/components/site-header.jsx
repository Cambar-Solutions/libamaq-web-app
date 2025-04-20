import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header
      className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
<div className="flex flex-wrap items-center gap-2 px-4 py-2 w-full">
<Button className="h-8 w-8" variant="ghost" size="icon" onClick={toggleSidebar}>
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
        <a href="#">
                <div>
                  
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">

                <Link to="/">
  <img
    src="/Tipografia_LIBAMAQ.png"
    alt="logo"
    className="max-h-10 sm:max-h-12 w-auto"
  />
</Link>
   

                </div>
              </a>
        </Breadcrumb>
      </div>
    </header>
  );
}
