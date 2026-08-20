"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  retrieveCustomerOrganizations,
  selectOrganizationForCart,
  submitPurchaseRequest,
} from "../data/b2b"
import type { B2BOrganization } from "../types/b2b"

export function useCustomerOrganizations() {
  return useQuery<B2BOrganization[], Error>({
    queryKey: ["b2b", "organizations"],
    queryFn: retrieveCustomerOrganizations,
  })
}

export function useSelectOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      cartId,
      organizationId,
    }: {
      cartId: string
      organizationId: string
    }) => selectOrganizationForCart(cartId, organizationId),
    onSuccess: (_data, variables) => {
      const cartId = (variables as any)?.cartId
      qc.invalidateQueries({ queryKey: ["cart", cartId] })
      qc.invalidateQueries({ queryKey: ["b2b", "organizations"] })
      qc.invalidateQueries({ queryKey: ["customer"] })
    },
  })
}

export function useSubmitPurchaseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cartId, po }: { cartId: string; po?: string }) =>
      submitPurchaseRequest(cartId, po),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] })
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["b2b", "organizations"] })
    },
  })
}
