## Data classification

Stored:
- product ID
- product handle
- title snapshot
- thumbnail snapshot
- viewed timestamp

Not stored:
- customer ID
- email
- cart ID
- price
- stock level
- promotion state
- region
- payment data
- analytics event

## Why no Medusa query is needed

The first version is a convenience history list, not a live product
recommendation system.

## Future upgrade path

If the feature needs account-level persistence or recommendations:

1. Create a RecentlyViewed custom module.
2. Link it to Customer and Product.
3. Add consent/retention policy.
4. Use a Store API route to record views.
5. Retrieve live product state from Medusa before display.
6. Add analytics only after explicit business/privacy approval.