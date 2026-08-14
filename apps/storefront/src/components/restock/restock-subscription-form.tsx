"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button, Input, Label, Text } from "@modules/common/components/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useSubscribeToRestock } from "@lib/restock/hooks"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type RestockSubscriptionFormProps = {
  variantId: string
  customerEmail?: string
  salesChannelId?: string
  className?: string
  description?: string
  submitLabel?: string
  onSuccess?: () => void
}

function normalizeErrorMessage(error: Error | null): string | null {
  if (!error) {
    return null
  }

  const message = error.message?.trim() ?? String(error)
  if (!message) {
    return "Something went wrong. Please try again."
  }

  const normalized = message.toLowerCase()
  if (
    normalized.includes("already subscribed") ||
    normalized.includes("duplicate") ||
    normalized.includes("already have") ||
    normalized.includes("already registered")
  ) {
    return "You are already subscribed to notifications for this item."
  }

  return message
}

export default function RestockSubscriptionForm({
  variantId,
  customerEmail,
  salesChannelId,
  className,
  description,
  submitLabel = "Notify me",
  onSuccess,
}: RestockSubscriptionFormProps) {
  const [email, setEmail] = useState(customerEmail ?? "")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (customerEmail) {
      setEmail(customerEmail)
    }
  }, [customerEmail])

  const mutation = useSubscribeToRestock({
    onSuccess: () => {
      setValidationError(null)
      setSuccessMessage(
        "Success! We'll let you know when this variant is back in stock."
      )
      onSuccess?.()
    },
    onError: () => {
      setSuccessMessage(null)
    },
  })

  const mutationError = useMemo(
    () => normalizeErrorMessage(mutation.error ?? null),
    [mutation.error]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mutation.isLoading || mutation.isSuccess) {
      return
    }

    setValidationError(null)
    setSuccessMessage(null)

    const emailToSubmit = customerEmail ?? email.trim()

    if (!variantId) {
      setValidationError("Variant information is required to subscribe.")
      return
    }

    if (!emailToSubmit) {
      setValidationError("Please enter your email address.")
      return
    }

    if (!EMAIL_REGEX.test(emailToSubmit)) {
      setValidationError("Enter a valid email address.")
      return
    }

    try {
      await mutation.mutateAsync({
        variant_id: variantId,
        email: emailToSubmit,
        sales_channel_id: salesChannelId,
      })
    } catch {
      // Error state is handled by mutation.error
    }
  }

  const showEmailField = !customerEmail
  const shouldShowError = Boolean(validationError || mutationError)

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-slate-950">
        <div>
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {description ??
              "Get notified by email when this variant comes back in stock."}
          </Text>
        </div>

        {customerEmail && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-neutral-700 dark:bg-slate-900">
            <Text className="text-sm text-gray-800 dark:text-gray-200">
              Subscribing with your signed-in email:
            </Text>
            <Text className="font-semibold text-gray-900 dark:text-white">
              {customerEmail}
            </Text>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {showEmailField && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="restock-email">Email address</Label>
              <Input
                id="restock-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={mutation.isLoading}
                className="dark:border-neutral-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={mutation.isLoading}
            disabled={mutation.isLoading || mutation.isSuccess}
            data-testid="restock-subscribe-button"
          >
            {mutation.isSuccess ? "Subscribed" : submitLabel}
          </Button>

          {shouldShowError && (
            <ErrorMessage
              error={validationError ?? mutationError}
              data-testid="restock-subscription-error"
            />
          )}

          {successMessage && (
            <div
              className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800/70 dark:bg-green-900/10"
              role="status"
              aria-live="polite"
              data-testid="restock-subscription-success"
            >
              <Text className="text-sm text-green-900 dark:text-green-100">
                {successMessage}
              </Text>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
