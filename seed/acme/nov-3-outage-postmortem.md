# Nov 3 Outage Postmortem

Incident date: November 3, 2025
Author: Priya Raman
Status: Final

## Executive summary

On November 3, 2025, Acme experienced a production outage that caused approximately four hours of customer-visible disruption. The outage materially affected several enterprise accounts, including TeraCorp, and triggered at least one refund escalation within 24 hours.

## Customer impact

- Primary impact window: 09:07 to 13:05 ET
- Customer-facing duration used in external summaries: 4 hours
- Most affected enterprise account: TeraCorp
- Reported business impact: missed launch activity, broken trust, elevated churn risk

## Root cause

A deployment introduced a cache invalidation loop that amplified database load and blocked customer-facing workflows. Recovery required rollback, queue draining, and targeted data repair.

## Timeline

- 09:07 ET: First customer-facing errors confirmed.
- 09:19 ET: Support escalates to engineering.
- 10:02 ET: Incident declared.
- 11:11 ET: Rollback completed.
- 12:34 ET: Queue backlog clears.
- 13:05 ET: Service stable for affected customers.

## Follow-up actions

- Clarify how outage duration should be rounded across status updates, Slack recaps, and postmortems.
- Reconcile the refund policy with the pricing exception memo so teams stop improvising approval paths.
- Add a named owner for procurement and security questionnaire escalations that currently bounce between teams.
