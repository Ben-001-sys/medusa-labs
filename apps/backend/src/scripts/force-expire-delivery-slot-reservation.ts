// import type { ExecArgs } from "@medusajs/framework/types"

// import { DELIVERY_SLOT_MODULE } from "../modules/delivery-slot"
// import DeliverySlotModuleService from "../modules/delivery-slot/service"

// export default async function forceExpireDeliverySlotReservation({
//   container,
//   args,
// }: ExecArgs) {
//   const [reservationId] = args

//   if (!reservationId) {
//     throw new Error(
//       "Usage: medusa exec ./src/scripts/force-expire-delivery-slot-reservation.ts <reservation-id>"
//     )
//   }

//   const deliverySlotService =
//     container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE)

//   const reservation =
//     await deliverySlotService.retrieveDeliverySlotReservation(
//       reservationId
//     )

//   await deliverySlotService.updateDeliverySlotReservations({
//     id: reservation.id,
//     expires_at: new Date(Date.now() - 60_000),
//   })

//   console.log(`Reservation ${reservation.id} is now expired by timestamp.`)
// }