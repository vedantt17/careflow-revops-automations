export const accounts = [
  { id: 'AC-104', name: 'Harbor Primary Care', segment: 'Mid-market', owner: 'A. Patel', arr: 184000, renewal: '2026-08-18', health: 72, licenses: 60, assigned: 52, invoice: 'INV-4821', invoiceStatus: 'Due in 4 days', issue: '8 unassigned licenses', confidence: 94 },
  { id: 'AC-118', name: 'Summit Orthopedics', segment: 'Enterprise', owner: 'M. Rivera', arr: 426000, renewal: '2026-09-02', health: 61, licenses: 118, assigned: 135, invoice: 'INV-4894', invoiceStatus: 'Payment mismatch', issue: 'Invoice differs by $4,200', confidence: 91 },
  { id: 'AC-122', name: 'Cedar Women\'s Health', segment: 'Growth', owner: 'N. Chen', arr: 96000, renewal: '2026-08-05', health: 83, licenses: 24, assigned: 24, invoice: 'INV-4910', invoiceStatus: 'Ready to send', issue: 'Renewal brief due', confidence: 97 },
  { id: 'AC-133', name: 'Northline Pediatrics', segment: 'Mid-market', owner: 'S. Brooks', arr: 162000, renewal: '2026-10-11', health: 79, licenses: 45, assigned: 45, invoice: 'INV-4942', invoiceStatus: 'Due in 12 days', issue: 'Usage trend declining', confidence: 88 },
  { id: 'AC-141', name: 'Solace Cardiology Group', segment: 'Enterprise', owner: 'A. Patel', arr: 318000, renewal: '2026-08-29', health: 67, licenses: 84, assigned: 92, invoice: 'INV-4973', invoiceStatus: 'Approval hold', issue: 'Contract amendment pending', confidence: 93 },
  { id: 'AC-152', name: 'Westbrook Family Medicine', segment: 'Growth', owner: 'N. Chen', arr: 72000, renewal: '2026-11-07', health: 89, licenses: 18, assigned: 18, invoice: 'INV-4998', invoiceStatus: 'Paid', issue: 'No exception', confidence: 99 }
];

export const workflowRuns = [
  { id: 'WF-8802', workflow: 'License utilization review', account: 'Harbor Primary Care', owner: 'CS Ops', status: 'Needs approval', started: '09:12', savings: '$1,840 modeled' },
  { id: 'WF-8801', workflow: 'Invoice variance triage', account: 'Summit Orthopedics', owner: 'Finance Ops', status: 'Routed', started: '08:48', savings: '$2,100 modeled' },
  { id: 'WF-8799', workflow: 'Renewal leadership brief', account: 'Cedar Women\'s Health', owner: 'RevOps', status: 'Delivered', started: '08:12', savings: '$620 modeled' },
  { id: 'WF-8797', workflow: 'Usage-risk signal', account: 'Northline Pediatrics', owner: 'CS Ops', status: 'In review', started: '07:56', savings: '$780 modeled' }
];

export const monthlySeries = [
  { label: 'Feb', arr: 92, health: 81 }, { label: 'Mar', arr: 96, health: 79 }, { label: 'Apr', arr: 101, health: 78 },
  { label: 'May', arr: 106, health: 76 }, { label: 'Jun', arr: 111, health: 75 }, { label: 'Jul', arr: 116, health: 74 }
];

export function accountRecommendation(account) {
  const actions = [];
  if (account.assigned < account.licenses) actions.push(`Route ${account.licenses - account.assigned} unassigned licenses to the ${account.owner} adoption review.`);
  if (account.invoiceStatus.includes('mismatch')) actions.push('Open Finance review with the contract amendment and invoice line-level variance attached.');
  if (account.health < 70) actions.push('Create a customer-success save plan with a 14-day follow-up and leadership visibility.');
  if (account.renewal <= '2026-08-31') actions.push('Generate the renewal brief and request commercial approval before the renewal window narrows.');
  if (!actions.length) actions.push('No urgent exception detected. Keep the account in the standard weekly review cadence.');
  return actions;
}

export function statusTone(status) {
  if (status === 'Delivered' || status === 'Paid') return 'positive';
  if (status === 'Needs approval' || status === 'Approval hold' || status === 'Payment mismatch') return 'critical';
  if (status === 'Routed' || status === 'In review' || status === 'Due in 4 days') return 'warning';
  return 'neutral';
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
