# CareFlow RevOps Automations

CareFlow is a public, synthetic demonstration of how a healthcare SaaS Revenue Operations team can turn recurring commercial work into auditable AI-assisted workflows.

**Live demo:** deployment URL added after production verification  
**Target role family:** Revenue Operations, Business Operations, AI Enablement, Healthcare Operations

## Problem

Revenue Operations teams often reconcile Salesforce data, licenses, invoices, customer health, renewals, and leadership reporting by hand. The work is sensitive and cross-functional, so a reliable solution needs both automation and a human approval boundary.

CareFlow turns those inputs into an exception queue, deterministic agent recommendations, an n8n-style workflow path, a human approval action, and a downloadable leadership brief.

## What a reviewer can do

1. Filter the command center by commercial segment.
2. Inspect accounts with license, invoice, renewal, or usage exceptions.
3. Run an agent review, then approve and route a follow-up.
4. Inspect the automation ledger and workflow path.
5. Generate and download a leadership-ready commercial brief.

## Architecture

```text
Synthetic Salesforce-style account + license + invoice data
  -> validation and exception rules
  -> deterministic agent recommendation layer
  -> human approval boundary
  -> workflow/audit ledger + leadership brief export
```

The repository also includes `workflows/license_exception_triage.n8n.json`, an n8n design reference that maps the production-style integration path: Salesforce snapshot, validation, Claude adapter, human approval, and CRM task creation.

## Stack

- Frontend: semantic HTML, modern CSS, ES modules, Lucide icons
- Data: deterministic synthetic healthcare commercial accounts
- Automation design: Salesforce-style data model, n8n workflow export, Claude-ready adapter boundary
- Quality: Node built-in tests and syntax checks
- Deployment: Vercel static hosting

## Data provenance and safety

All account names, people, invoices, contracts, ARR values, and operational events are deterministic synthetic examples created for this portfolio project. No patient data, customer data, credentials, or external CRM connection is used.

## Run locally

```bash
npm.cmd test
npm.cmd run check
npx.cmd serve . -l 4173
```

Then open `http://localhost:4173`.

## Tests

`npm.cmd test` validates account integrity, recommendation routing, and output helpers. `npm.cmd run check` validates the JavaScript modules parse successfully.

## Limitations and next steps

- Agent output is deterministic in the public demo. A production version would call Claude only from a server-side adapter with versioned prompts, logging, and redaction.
- The n8n workflow is an importable design reference; it is not executed in the static deployment.
- Real Salesforce, billing, and customer-success integrations would use OAuth, least-privilege scopes, source freshness checks, and a warehouse-backed audit log.
