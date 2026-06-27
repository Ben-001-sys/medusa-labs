# Line Item Metadata Decision

## Requirement
Allow customers to add a short gift message and a packaging instruction to
an individual cart item.

## Chosen implementation
Use Medusa LineItem metadata.

## Why
The values belong only to one item in one cart/order and have no independent
workflow, permissions, attachments, staff queue, reporting, or lifecycle.

## Metadata keys
- gift_wrap: boolean
- gift_message: string
- packaging_note: string

## Not used
- Custom module
- Module link
- Workflow hook
- Subscriber
- Scheduled job
- Custom Admin page

## Upgrade trigger
Move to a personalization/production module when uploaded files, approval
workflows, staff notes, supplier instructions, or structured audit history are required.