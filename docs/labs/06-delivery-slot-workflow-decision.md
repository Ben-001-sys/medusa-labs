# Delivery Slot Reservation Workflow Decision

## Requirement
A signed-in customer selects a delivery slot for an existing cart.

## Chosen implementation
- Delivery Slot custom module for durable slot/reservation data.
- Custom Store API route.
- Custom workflow.
- Cart and delivery-slot locks.
- Compensation deletes a newly created reservation if later workflow work fails.

## Source of truth
DeliverySlotReservation is the source of truth for a cart's selected slot.

The Cart is not treated as the source of truth for delivery capacity.

## Scope
This is a temporary delivery-capacity hold, not final dispatch or fulfillment.

## Future work
- Expire abandoned holds.
- Validate reservation during cart completion.
- Convert confirmed reservation to an order appointment.
- Send confirmed appointments to Alicide/TMS.