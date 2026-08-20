import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Heading,
  Text,
  Table,
  Button,
  Badge,
} from "@modules/common/components/ui"
import { notFound } from "next/navigation"
import { retrieveCustomerOrganizations } from "@lib/data/b2b"

export const metadata: Metadata = {
  title: "Organizations",
  description: "Your B2B organizations",
}

export default async function OrganizationsPage() {
  const data = await retrieveCustomerOrganizations()

  if (!data) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="b2b-organizations-page">
      <div className="mb-6">
        <Heading level="h1">Organizations</Heading>
        <Text className="text-base-regular mt-1">
          Organizations you belong to. Actions are limited by your role.
        </Text>
      </div>

      <div>
        {data.length === 0 ? (
          <div className="py-8">
            <Text>No organizations found for your account.</Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <tr>
                <Table.Head>Display name</Table.Head>
                <Table.Head>Handle</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Your role</Table.Head>
                <Table.Head>Actions</Table.Head>
              </tr>
            </Table.Header>
            <Table.Body>
              {data.map((org) => (
                <Table.Row key={org.id}>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <span className="font-medium">{org.display_name}</span>
                      <span className="text-sm text-gray-500">
                        {org.legal_name ?? ""}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text as="span">{org.handle}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {/* Status comes from backend model, but this list route doesn't return status. Show active by default. */}
                    <Badge color="grey">Active</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text as="span">{org.role ?? "Member"}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <LocalizedClientLink
                        href={`/account/organizations/${org.id}`}
                      >
                        <Button variant="secondary" size="small">
                          View
                        </Button>
                      </LocalizedClientLink>
                      {/* Additional actions can be added here based on role */}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  )
}
