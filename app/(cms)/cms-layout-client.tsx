"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { CMSSidebar } from "@/components/cms/cms-sidebar"
import { CMSHeader } from "@/components/cms/cms-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function CMSLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <CMSSidebar />
        <SidebarInset>
          <CMSHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
