import { accounts, workflowRuns, monthlySeries, accountRecommendation, formatCurrency, statusTone } from './data.js';

const state = { activeTab: 'command', segment: 'All segments', selectedId: 'AC-104', runs: [...workflowRuns], approved: new Set(), briefOpen: false };
const app = document.querySelector('#app');

const icon = (name, size = 16) => `<i data-lucide="${name}" width="${size}" height="${size}" aria-hidden="true"></i>`;
const selected = () => accounts.find((account) => account.id === state.selectedId) ?? accounts[0];
const filtered = () => state.segment === 'All segments' ? accounts : accounts.filter((account) => account.segment === state.segment);
const badge = (value) => `<span class="badge ${statusTone(value)}">${value}</span>`;

function headlineMetrics() {
  const scoped = filtered();
  const arr = scoped.reduce((sum, account) => sum + account.arr, 0);
  const exceptions = scoped.filter((account) => account.issue !== 'No exception').length;
  const approval = state.runs.filter((run) => run.status === 'Needs approval').length;
  return [
    ['Managed ARR', formatCurrency(arr), 'scoped recurring revenue'],
    ['Open exceptions', String(exceptions), 'license, invoice, or renewal'],
    ['Automation coverage', '78%', 'repeatable work on a workflow'],
    ['Awaiting approval', String(approval), 'human-in-the-loop decisions']
  ];
}

function metricCards() {
  return `<section class="metrics">${headlineMetrics().map(([label, value, detail], index) => `<article class="metric ${index === 0 ? 'metric-emphasis' : ''}"><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`).join('')}</section>`;
}

function chart() {
  const max = Math.max(...monthlySeries.map((item) => item.arr));
  return `<section class="panel chart-panel"><div class="panel-heading"><div><p class="eyebrow">Commercial health</p><h2>ARR is rising. Exceptions need ownership.</h2></div><span class="data-source">salesforce_account_snapshot</span></div><div class="chart" aria-label="Monthly ARR trend">${monthlySeries.map((item) => `<div class="bar-group"><span class="bar-value">${item.arr}</span><div class="bar" style="height:${Math.round((item.arr / max) * 142)}px"></div><span>${item.label}</span></div>`).join('')}</div><div class="chart-note"><span>${icon('activity')} Modeled ARR, $K</span><span>${icon('shield-check')} Synthetic Salesforce-style data</span></div></section>`;
}

function accountTable() {
  return `<section class="panel table-panel"><div class="panel-heading"><div><p class="eyebrow">Exception queue</p><h2>Revenue workflows needing a decision</h2></div><button class="text-action" data-action="run-agent">${icon('sparkles')} Run agent review</button></div><div class="table-wrap"><table><thead><tr><th>Account</th><th>Health</th><th>Renewal</th><th>Invoice</th><th>Exception</th><th></th></tr></thead><tbody>${filtered().map((account) => `<tr class="${account.id === state.selectedId ? 'selected-row' : ''}"><td><strong>${account.name}</strong><span>${account.owner} · ${formatCurrency(account.arr)} ARR</span></td><td><span class="health ${account.health < 70 ? 'health-low' : ''}">${account.health}</span></td><td>${account.renewal}</td><td>${badge(account.invoiceStatus)}</td><td>${account.issue}</td><td><button class="icon-button" title="Review ${account.name}" aria-label="Review ${account.name}" data-action="select-account" data-id="${account.id}">${icon('arrow-up-right')}</button></td></tr>`).join('')}</tbody></table></div></section>`;
}

function agentPanel() {
  const account = selected();
  const recommendations = accountRecommendation(account);
  return `<aside class="agent-panel"><div class="agent-header"><div class="agent-orb">${icon('bot', 20)}</div><div><p class="eyebrow">AI operations agent</p><h2>Agent recommendation</h2></div></div><div class="account-chip">${icon('building-2')} ${account.name}</div><p class="agent-context">${account.issue}. Confidence <strong>${account.confidence}%</strong>, based on license, invoice, renewal, and health signals.</p><ol class="recommendations">${recommendations.map((recommendation, index) => `<li><span>${index + 1}</span><p>${recommendation}</p></li>`).join('')}</ol><div class="agent-actions"><button class="primary" data-action="approve" ${state.approved.has(account.id) ? 'disabled' : ''}>${icon('check')} ${state.approved.has(account.id) ? 'Approved and routed' : 'Approve and route'}</button><button class="secondary" data-action="generate-brief">${icon('presentation')} Generate leadership brief</button></div><p class="disclosure">Agent output is deterministic demo logic. A production adapter can invoke Claude through a server-side API with audited prompts and approval gates.</p></aside>`;
}

function workflowPanel() {
  return `<section class="panel workflow-panel"><div class="panel-heading"><div><p class="eyebrow">Workflow orchestration</p><h2>n8n-style decision path</h2></div><span class="data-source">workflow: license_exception_triage</span></div><div class="workflow"><div class="workflow-node"><span>${icon('database')}</span><strong>Salesforce sync</strong><small>account, opportunity, license</small></div><div class="workflow-line"></div><div class="workflow-node"><span>${icon('scan-search')}</span><strong>Validate</strong><small>invoice and usage rules</small></div><div class="workflow-line"></div><div class="workflow-node active"><span>${icon('bot')}</span><strong>Agent triage</strong><small>recommend action</small></div><div class="workflow-line"></div><div class="workflow-node"><span>${icon('user-check')}</span><strong>Human approval</strong><small>Finance or CS owner</small></div><div class="workflow-line"></div><div class="workflow-node"><span>${icon('send')}</span><strong>Route follow-up</strong><small>CRM task + audit event</small></div></div></section>`;
}

function runsPanel() {
  return `<section class="panel runs-panel"><div class="panel-heading"><div><p class="eyebrow">Automation ledger</p><h2>Recent runs</h2></div><button class="text-action" data-action="open-automation">${icon('list-checks')} View all</button></div><div class="runs">${state.runs.map((run) => `<div class="run"><div class="run-icon">${icon(run.status === 'Delivered' ? 'check-circle-2' : 'workflow')}</div><div><strong>${run.workflow}</strong><p>${run.account} · ${run.owner}</p></div><div><span>${run.started}</span>${badge(run.status)}</div></div>`).join('')}</div></section>`;
}

function commandView() {
  return `<div class="workspace">${metricCards()}<div class="layout-primary"><div class="left-stack">${chart()}${accountTable()}</div>${agentPanel()}</div>${workflowPanel()}${runsPanel()}</div>`;
}

function renewalView() {
  const items = [...accounts].sort((a, b) => a.renewal.localeCompare(b.renewal));
  return `<div class="workspace"><section class="page-intro"><p class="eyebrow">Renewal intelligence</p><h1>Plan the accounts that need commercial attention.</h1><p>Each recommendation combines license utilization, invoice state, customer health, and renewal timing. No decision is automatically sent.</p></section><section class="panel renewal-grid">${items.map((account) => `<article class="renewal-card"><div><span>${account.segment}</span><strong>${account.name}</strong><small>${formatCurrency(account.arr)} ARR · Renewal ${account.renewal}</small></div><div class="score-wrap"><b class="${account.health < 70 ? 'low-score' : ''}">${account.health}</b><small>health</small></div><p>${accountRecommendation(account)[0]}</p><button class="secondary" data-action="select-account" data-id="${account.id}">${icon('scan-search')} Review action</button></article>`).join('')}</section></div>`;
}

function automationView() {
  return `<div class="workspace"><section class="page-intro"><p class="eyebrow">Automation operations</p><h1>Operate agents with a human approval boundary.</h1><p>Workflow outcomes remain traceable from source signal to routed task. Savings shown below are modeled scenarios, not realized results.</p></section>${workflowPanel()}<section class="panel run-table"><div class="panel-heading"><div><p class="eyebrow">Run history</p><h2>Automation audit ledger</h2></div><button class="primary" data-action="run-agent">${icon('play')} Run license review</button></div><div class="table-wrap"><table><thead><tr><th>Run</th><th>Workflow</th><th>Account</th><th>Owner</th><th>Status</th><th>Modeled value</th></tr></thead><tbody>${state.runs.map((run) => `<tr><td>${run.id}</td><td><strong>${run.workflow}</strong></td><td>${run.account}</td><td>${run.owner}</td><td>${badge(run.status)}</td><td>${run.savings}</td></tr>`).join('')}</tbody></table></div></section></div>`;
}

function reportsView() {
  const account = selected();
  return `<div class="workspace"><section class="page-intro report-intro"><div><p class="eyebrow">Leadership reporting</p><h1>Generate a concise, decision-ready brief.</h1><p>Choose an account, review the evidence, and produce a structured narrative for Finance, Sales, and Customer Success.</p></div><button class="primary" data-action="generate-brief">${icon('file-text')} Generate this week’s brief</button></section><section class="report-layout"><article class="panel report-preview"><div class="deck-cover"><span>WEEKLY COMMERCIAL REVIEW</span><h2>${account.name}</h2><p>Renewal, license, invoice, and account-health brief</p><small>Prepared from synthetic Salesforce-style data · July 2026</small></div><div class="slide-grid"><div><span>ARR</span><strong>${formatCurrency(account.arr)}</strong><small>Contracted recurring revenue</small></div><div><span>Health</span><strong>${account.health}/100</strong><small>Composite operational signal</small></div><div><span>Invoice</span><strong>${account.invoiceStatus}</strong><small>${account.invoice}</small></div><div><span>Next action</span><strong>${accountRecommendation(account)[0]}</strong></div></div></article>${agentPanel()}</section></div>`;
}

function render() {
  const views = { command: commandView, renewals: renewalView, automation: automationView, reports: reportsView };
  app.innerHTML = `<header class="topbar"><a class="brand" href="#" aria-label="CareFlow home"><span class="brand-mark">${icon('heart-pulse', 20)}</span><span><b>CareFlow</b><em>REVOPS AUTOMATIONS</em></span></a><nav aria-label="Primary navigation">${[['command', 'Command center'], ['renewals', 'Renewal signals'], ['automation', 'Automation ledger'], ['reports', 'Leadership brief']].map(([id, label]) => `<button class="nav-link ${state.activeTab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`).join('')}</nav><div class="top-actions"><select aria-label="Department segment" data-action="segment"><option>All segments</option><option>Enterprise</option><option>Mid-market</option><option>Growth</option></select><button class="top-button" data-action="run-agent">${icon('sparkles')} Run automations</button></div></header><main>${views[state.activeTab]()}</main>${state.briefOpen ? modal() : ''}<div class="toast-region" aria-live="polite"></div>`;
  window.lucide?.createIcons();
}

function modal() {
  const account = selected();
  const recommendations = accountRecommendation(account);
  return `<div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="brief-title"><button class="close" aria-label="Close brief" data-action="close-brief">${icon('x')}</button><p class="eyebrow">Generated leadership brief</p><h2 id="brief-title">${account.name}: commercial action summary</h2><div class="modal-section"><span>Signal</span><p>${account.issue}; health is ${account.health}/100 and the renewal date is ${account.renewal}.</p></div><div class="modal-section"><span>Recommendation</span><p>${recommendations.join(' ')}</p></div><div class="modal-section"><span>Approval boundary</span><p>Send only after Finance or Customer Success confirms the evidence and owner.</p></div><div class="modal-actions"><button class="secondary" data-action="close-brief">Review later</button><button class="primary" data-action="download-brief">${icon('download')} Download brief</button></div></section></div>`;
}

function toast(message) {
  const region = document.querySelector('.toast-region');
  region.innerHTML = `<div class="toast">${icon('check-circle-2')} ${message}</div>`;
  window.lucide?.createIcons();
  setTimeout(() => { if (region) region.innerHTML = ''; }, 3800);
}

function downloadBrief() {
  const account = selected();
  const content = `CARE FLOW | Weekly Commercial Review\n\n${account.name}\nARR: ${formatCurrency(account.arr)}\nHealth: ${account.health}/100\nRenewal: ${account.renewal}\nInvoice: ${account.invoice} (${account.invoiceStatus})\nException: ${account.issue}\n\nRecommended next steps:\n${accountRecommendation(account).map((item, index) => `${index + 1}. ${item}`).join('\n')}\n\nSynthetic demonstration data only.`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${account.name.replaceAll(' ', '-').toLowerCase()}-commercial-brief.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  state.briefOpen = false;
  render();
  toast('Leadership brief downloaded.');
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action], [data-tab]');
  if (!button) return;
  if (button.dataset.tab) { state.activeTab = button.dataset.tab; render(); return; }
  const { action, id } = button.dataset;
  if (action === 'select-account') { state.selectedId = id; state.activeTab = 'command'; render(); return; }
  if (action === 'generate-brief') { state.briefOpen = true; render(); return; }
  if (action === 'close-brief') { state.briefOpen = false; render(); return; }
  if (action === 'download-brief') { downloadBrief(); return; }
  if (action === 'approve') {
    state.approved.add(selected().id);
    state.runs = [{ id: `WF-${8803 + state.runs.length}`, workflow: 'Approved exception route', account: selected().name, owner: 'RevOps', status: 'Routed', started: 'Now', savings: 'Human-approved' }, ...state.runs];
    render(); toast(`Follow-up routed for ${selected().name}.`); return;
  }
  if (action === 'run-agent') {
    state.runs = [{ id: `WF-${8810 + state.runs.length}`, workflow: 'License utilization review', account: selected().name, owner: 'CS Ops', status: 'Needs approval', started: 'Now', savings: '$1,120 modeled' }, ...state.runs];
    render(); toast('Agent review completed. A human approval is required before routing.'); return;
  }
  if (action === 'open-automation') { state.activeTab = 'automation'; render(); }
});

document.addEventListener('change', (event) => {
  if (event.target.dataset.action === 'segment') { state.segment = event.target.value; render(); }
});

render();
