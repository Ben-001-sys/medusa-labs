"use client"

import React, { useEffect, useState } from "react"
import { Heading, Text, Button, Input } from "@modules/common/components/ui"
import { useActionState } from "react"
import { attachOrganizationToCart } from "@lib/data/b2b"
import type { B2BOrganization } from "@lib/types/b2b"

export default function OrganizationSelectorClient({
  organizations,
  cartId,
}: {
  organizations: B2BOrganization[]
  cartId?: string
}) {
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Hydrate from localStorage if present (best-effort display only)
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("b2b_selected_org")
        : null
    if (stored) setSelected(stored)
  }, [])

  const [state, formAction] = useActionState(attachOrganizationToCart, {
    success: false,
    error: undefined,
    result: null,
  })

  useEffect(() => {
    if (state.success && state.result) {
      setMessage("Organization attached to cart")
      if (selected) {
        try {
          localStorage.setItem("b2b_selected_org", selected)
        } catch {}
      }
    } else if (!state.success && state.error) {
      setMessage(state.error)
    }
  }, [state.success, state.error, state.result])

  if (!organizations || organizations.length === 0) {
    return (
      <div className="py-4">
        <Heading level="h3">Organization</Heading>
        <Text className="text-sm text-gray-600 mt-1">
          You are not a member of any organization.
        </Text>
      </div>
    )
  }

  return (
    <div className="py-4">
      <Heading level="h3">Organization</Heading>
      <Text className="text-sm text-gray-600 mt-1">
        Select an organization to attach to your cart for B2B pricing.
      </Text>

      <form action={formAction} className="mt-3 flex items-center gap-2">
        <input
          type="hidden"
          name="organization_id"
          value={selected ?? organizations[0].id}
        />
        <select
          name="organization_display"
          value={selected ?? organizations[0].id}
          onChange={(e) => setSelected(e.target.value)}
          className="h-10 rounded-md border border-gray-200 px-3"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.display_name} ({org.handle})
            </option>
          ))}
        </select>

        <Button type="submit" variant="primary" size="small" isLoading={false}>
          Attach
        </Button>
      </form>

      {message && <Text className="text-sm mt-2 text-rose-600">{message}</Text>}

      <div className="mt-2 text-sm text-gray-600">
        <Text>Current cart: {cartId ?? "No cart"}</Text>
      </div>
    </div>
  )
}
