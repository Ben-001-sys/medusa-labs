"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

type RestockProviderProps = {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export default function RestockProvider({ children }: RestockProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
