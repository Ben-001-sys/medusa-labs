import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import RestockProvider from "../providers/restock-provider"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <RestockProvider>
          <main className="relative">{props.children}</main>
        </RestockProvider>
      </body>
    </html>
  )
}
