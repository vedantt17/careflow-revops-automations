import test from 'node:test';
import assert from 'node:assert/strict';
import { accounts, accountRecommendation, formatCurrency, statusTone } from '../src/data.js';

test('all synthetic accounts have unique identifiers and valid license counts', () => {
  assert.equal(new Set(accounts.map((account) => account.id)).size, accounts.length);
  for (const account of accounts) {
    assert.ok(account.licenses > 0);
    assert.ok(account.assigned > 0);
    assert.ok(account.health >= 0 && account.health <= 100);
  }
});

test('agent recommendations route known operational exceptions', () => {
  const harbor = accounts.find((account) => account.id === 'AC-104');
  const summit = accounts.find((account) => account.id === 'AC-118');
  assert.match(accountRecommendation(harbor).join(' '), /unassigned licenses/i);
  assert.match(accountRecommendation(summit).join(' '), /Finance review/i);
});

test('formatting helpers provide review-safe values', () => {
  assert.equal(formatCurrency(184000), '$184,000');
  assert.equal(statusTone('Needs approval'), 'critical');
  assert.equal(statusTone('Delivered'), 'positive');
});
