import PurchaseRequestDetailClient from "@modules/b2b/components/PurchaseRequestDetail.client"

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold">Purchase request</h1>
      <div className="mt-4">
        <PurchaseRequestDetailClient id={params.id} />
      </div>
    </div>
  )
}
