import { MedusaService } from "@medusajs/framework/utils"
import { DeliverySlot } from "./models/delivery-slot"
import { DeliverySlotReservation } from "./models/delivery-slot-reservation"

class DeliverySlotModuleService extends MedusaService({
  DeliverySlot,
  DeliverySlotReservation,
}) {}

export default DeliverySlotModuleService