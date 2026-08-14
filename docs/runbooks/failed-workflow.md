# Failed Workflow Runbook

## Detect
- Alert from workflow error metric
- Admin/support report
- Connector failure queue

## Identify
1. Workflow name
2. Execution ID
3. Correlation ID
4. Affected order/cart/product/subscription
5. Failed step
6. Retry count
7. External-system response

## Decide
- Retry safely
- Correct data and retry
- Suppress/reject
- Escalate to platform owner

## Verify
- Check durable sync/attempt record
- Check downstream system
- Run reconciliation if necessary
- Record incident outcome