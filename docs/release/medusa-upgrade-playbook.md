# Medusa Upgrade Playbook

## 1. Prepare
- Read release notes and migration guidance.
- Create upgrade branch.
- Update dependency versions.
- Regenerate lockfile.
- Review plugin compatibility.

## 2. Test
- Run unit, module, workflow, route, and storefront tests.
- Run checkout regression tests.
- Run connector contract tests.
- Run migration on production-like database copy.

## 3. Deploy to staging
- Run migrations once.
- Deploy server and worker.
- Test Admin, Store API, checkout, payment, fulfillment, jobs,
  subscribers, connectors, and plugin routes.

## 4. Deploy production
- Backup first.
- Use compatible expand migration.
- Monitor logs, workflow failures, queue depth, errors, and latency.
- Keep rollback code ready.

## 5. Verify
- Place test order.
- Trigger PIM update.
- Trigger warehouse handoff.
- Trigger back-in-stock workflow.
- Verify Admin and worker behavior.

## 6. Close
- Document version.
- Record changes.
- Update compatibility matrix.