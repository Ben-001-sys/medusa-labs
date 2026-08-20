"use server"

import { sdk } from "@lib/config"
import { listRegions } from "./regions"
import { getCacheOptions } from "./cookies"

export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint returns 404 (locales not configured).
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  // Prefer deriving locales from regions when available to avoid
  // calling an endpoint that may not exist on older Medusa installs.
  const regions = await listRegions()
  if (regions) {
    const localeMap = new Map<string, Locale>()

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (!c) return
        const countryCode = (c.iso_2 ?? "").toUpperCase()
        if (!countryCode) return

        // Use a reasonable default language (English) with the country region
        // so codes look like `en-US`, `en-DK` which work with Intl APIs.
        const code = `en-${countryCode}`
        const name = c.name ?? code

        if (!localeMap.has(code)) {
          localeMap.set(code, { code, name })
        }
      })
    })

    return Array.from(localeMap.values())
  }

  // If regions are not available, try the locales endpoint (may 404).
  const next = {
    ...(await getCacheOptions("locales")),
  }

  try {
    const res = await sdk.client.fetch<{ locales: Locale[] }>(
      `/store/locales`,
      {
        method: "GET",
        next,
        cache: "force-cache",
      }
    )

    return res.locales
  } catch {
    return null
  }
}
