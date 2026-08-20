import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  Heading,
  Text,
  Container,
  Badge,
  Button,
} from "@modules/common/components/ui"
import { retrieveCustomerOrganizations } from "@lib/data/b2b"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const orgs = await retrieveCustomerOrganizations()
  const org = orgs.find((o) => o.id === params.id)
  if (!org) {
    return {
      title: "Organization",
    }
  }
  return {
    title: org.display_name,
  }
}

export default async function OrganizationDetail({
  params,
}: {
  params: { id: string }
}) {
  const orgs = await retrieveCustomerOrganizations()
  const org = orgs.find((o) => o.id === params.id)

  if (!org) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="b2b-organization-detail">
      <div className="mb-6">
        <Heading level="h1">{org.display_name}</Heading>
        <Text className="text-base-regular mt-1">Handle: {org.handle}</Text>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Container className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Heading level="h2" className="text-lg">
                Organization information
              </Heading>
              <Text className="text-sm text-gray-600">
                Legal name and identifiers
              </Text>
            </div>
            <div className="flex gap-2">
              <LocalizedClientLink href="/account">
                <Button variant="transparent" size="small">
                  Back
                </Button>
              </LocalizedClientLink>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Text className="text-sm font-medium">Legal name</Text>
              <Text className="text-sm text-gray-700">
                {org.legal_name ?? "—"}
              </Text>
            </div>

            <div>
              <Text className="text-sm font-medium">Display name</Text>
              <Text className="text-sm text-gray-700">{org.display_name}</Text>
            </div>

            <div>
              <Text className="text-sm font-medium">Handle</Text>
              <Text className="text-sm text-gray-700">{org.handle}</Text>
            </div>

            <div>
              <Text className="text-sm font-medium">Sales channel</Text>
              <Text className="text-sm text-gray-700">
                {org.sales_channel_id ?? "Not configured"}
              </Text>
            </div>

            <div>
              <Text className="text-sm font-medium">Your role</Text>
              <Text className="text-sm text-gray-700">
                {org.role ?? "Member"}
              </Text>
            </div>
          </div>
        </Container>

        <Container>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Heading level="h3" className="text-base">
                Status
              </Heading>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* The store endpoint doesn't return status in the list; backend supports status on the model but not exposed here. */}
            <div>
              <Text className="text-sm font-medium">Status</Text>
              <Badge color="grey">Active</Badge>
            </div>

            <div>
              <Text className="text-sm font-medium">Members</Text>
              <Text className="text-sm text-gray-700">
                Member listing is not available via store API.
              </Text>
            </div>

            <div>
              <Text className="text-sm font-medium">
                Pricing / Customer Group
              </Text>
              <Text className="text-sm text-gray-700">
                {org.customer_group_id ?? "Not configured"}
              </Text>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}
