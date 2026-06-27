import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

const OrderPackageInstructionsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const packageInstructionsItems = data.items?.filter(
    (item: any) => item.metadata?.is_instructions === "true"
  )

  if (!packageInstructionsItems?.length) {
    return null
  }

  return (
    <Container className="mb-4">

      <Text className="font-medium h2-core mb-2">Package Instructions</Text>
      <div className="flex flex-col gap-4">
        {packageInstructionsItems.map((item: any) => (
          <div key={item.id} className="border-b last:border-b-0 pb-2">
            <Text className="font-medium">{item.title} (x{item.quantity})</Text>
            <Text className="text-sm text-gray-600">
              Package Instructions: {item.metadata?.package_instructions || "(No instructions)"}
            </Text>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderPackageInstructionsWidget