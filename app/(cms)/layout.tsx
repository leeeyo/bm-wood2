import type { Metadata } from "next"
import { CMSLayoutClient } from "./cms-layout-client"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CMSLayoutClient>{children}</CMSLayoutClient>
}
