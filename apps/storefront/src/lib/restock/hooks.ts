import { useMutation } from "@tanstack/react-query"
import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query"
import { createRestockSubscription } from "./client"
import type {
  CreateRestockSubscriptionRequest,
  CreateRestockSubscriptionResponse,
} from "./types"

export type UseSubscribeToRestockOptions = UseMutationOptions<
  CreateRestockSubscriptionResponse,
  Error,
  CreateRestockSubscriptionRequest,
  unknown
>

export function useSubscribeToRestock(
  options?: UseSubscribeToRestockOptions
): UseMutationResult<
  CreateRestockSubscriptionResponse,
  Error,
  CreateRestockSubscriptionRequest,
  unknown
> {
  return useMutation<
    CreateRestockSubscriptionResponse,
    Error,
    CreateRestockSubscriptionRequest,
    unknown
  >({
    mutationFn: createRestockSubscription,
    ...options,
  })
}
