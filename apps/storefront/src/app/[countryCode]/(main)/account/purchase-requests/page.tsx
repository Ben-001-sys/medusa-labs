import { retrieveCustomerPurchaseRequests } from "@lib/data/b2b"
import Link from "next/link"

export default async function Page() {
  const prs = await retrieveCustomerPurchaseRequests()

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold">Purchase requests</h1>
      <div className="mt-4 space-y-3">
        {prs.length === 0 ? (
          <div>No purchase requests found.</div>
        ) : (
          <ul className="space-y-2">
            {prs.map((p: any) => (
              <li key={p.id} className="border p-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{p.reference}</div>
                    <div className="text-sm text-gray-600">
                      Status: {p.status}
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/account/purchase-requests/${p.id}`}
                      className="text-sm text-blue-600"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
