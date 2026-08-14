## Channel ownership

Development:
- local provider owns feed and email.

Production:
- local provider owns feed.
- Resend provider owns email.

## Security rules

- API keys remain server-side environment variables.
- Templates are version-controlled.
- Dynamic HTML values are escaped.
- No arbitrary customer HTML is accepted.

## Reliability limitation

The provider reports a transport result.
It does not provide exactly-once business delivery.

A later outbox/notification-delivery ledger will prevent duplicate customer
messages during event replay and retry.