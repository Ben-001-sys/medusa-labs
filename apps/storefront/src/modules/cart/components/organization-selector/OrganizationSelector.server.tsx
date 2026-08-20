import React from "react"
import OrganizationSelectorClient from "./OrganizationSelector.client"
import { retrieveCustomerOrganizations } from "@lib/data/b2b"
import { retrieveCart } from "@lib/data/cart"

export default async function OrganizationSelector() {
  const organizations = await retrieveCustomerOrganizations()
  const cart = await retrieveCart()

  return (
    <OrganizationSelectorClient
      organizations={organizations}
      cartId={cart?.id}
    />
  )
}
