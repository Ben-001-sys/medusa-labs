"use client"

import React, { createContext, useContext, useState } from "react"
import { useSelectOrganization } from "../hooks/use-b2b"

type B2BContextShape = {
  selectedOrgId?: string | null
  setSelectedOrg: (orgId?: string | null) => Promise<void>
}

const B2BContext = createContext<B2BContextShape | undefined>(undefined)

export const B2BProvider = ({ children }: { children?: React.ReactNode }) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null | undefined>(
    undefined
  )
  const selectOrg = useSelectOrganization()

  async function setSelectedOrg(orgId?: string | null) {
    setSelectedOrgId(orgId)
    if (orgId) {
      try {
        // Assuming a cart exists in cookies/session; caller should ensure cartId
        const cartId =
          typeof window !== "undefined"
            ? localStorage.getItem("cart_id") || undefined
            : undefined
        if (cartId) {
          await selectOrg.mutateAsync({ cartId, organizationId: orgId })
        }
      } catch (e) {
        // swallow — UI should show mutation errors via hook state
      }
    }
  }

  return (
    <B2BContext.Provider
      value={{
        selectedOrgId,
        setSelectedOrg,
      }}
    >
      {children}
    </B2BContext.Provider>
  )
}

export function useB2B() {
  const ctx = useContext(B2BContext)
  if (!ctx) throw new Error("useB2B must be used within B2BProvider")
  return ctx
}
