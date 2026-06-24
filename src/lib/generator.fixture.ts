import type { ClueEntry } from './types';

/**
 * Synthetic clue entries used only in tests.
 * These are NOT part of the shipped bank and are never imported by game code.
 * Answers are chosen to interlock reliably (shared letters) across a variety
 * of seeds so the test suite exercises placement logic deterministically.
 */
export const FIXTURE_ENTRIES: ClueEntry[] = [
  {
    id: 'fix-defender', answer: 'DEFENDER', display: 'Defender',
    topic: 'defender', era: 'current',
    clues: { easy: 'e1', medium: 'm1', hard: 'h1', pro: 'p1' },
  },
  {
    id: 'fix-sentinel', answer: 'SENTINEL', display: 'Sentinel',
    topic: 'sentinel', era: 'current',
    clues: { easy: 'e2', medium: 'm2', hard: 'h2', pro: 'p2' },
  },
  {
    id: 'fix-entra', answer: 'ENTRA', display: 'Entra',
    topic: 'entra', era: 'current',
    clues: { easy: 'e3', medium: 'm3', hard: 'h3', pro: 'p3' },
  },
  {
    id: 'fix-intune', answer: 'INTUNE', display: 'Intune',
    topic: 'intune', era: 'current',
    clues: { easy: 'e4', medium: 'm4', hard: 'h4', pro: 'p4' },
  },
  {
    id: 'fix-compliance', answer: 'COMPLIANCE', display: 'Compliance',
    topic: 'intune', era: 'current',
    clues: { easy: 'e5', medium: 'm5', hard: 'h5', pro: 'p5' },
  },
  {
    id: 'fix-baseline', answer: 'BASELINE', display: 'Baseline',
    topic: 'intune', era: 'current',
    clues: { easy: 'e6', medium: 'm6', hard: 'h6', pro: 'p6' },
  },
  {
    id: 'fix-pim', answer: 'PIM', display: 'PIM',
    topic: 'entra', era: 'current',
    clues: { easy: 'e7', medium: 'm7', hard: 'h7', pro: 'p7' },
  },
  {
    id: 'fix-mfa', answer: 'MFA', display: 'MFA',
    topic: 'entra', era: 'current',
    clues: { easy: 'e8', medium: 'm8', hard: 'h8', pro: 'p8' },
  },
  {
    id: 'fix-asr', answer: 'ASR', display: 'ASR',
    topic: 'asr', era: 'current',
    clues: { easy: 'e9', medium: 'm9', hard: 'h9', pro: 'p9' },
  },
  {
    id: 'fix-casb', answer: 'CASB', display: 'CASB',
    topic: 'defender-cloud-apps', era: 'current',
    clues: { easy: 'e10', medium: 'm10', hard: 'h10', pro: 'p10' },
  },
  {
    id: 'fix-kql', answer: 'KQL', display: 'KQL',
    topic: 'sentinel', era: 'current',
    clues: { easy: 'e11', medium: 'm11', hard: 'h11', pro: 'p11' },
  },
  {
    id: 'fix-aad', answer: 'AAD', display: 'AAD',
    topic: 'entra', era: 'legacy',
    clues: { easy: 'e12', medium: 'm12', hard: 'h12', pro: 'p12' },
  },
  {
    id: 'fix-adfs', answer: 'ADFS', display: 'ADFS',
    topic: 'entra', era: 'legacy',
    clues: { easy: 'e13', medium: 'm13', hard: 'h13', pro: 'p13' },
  },
  {
    id: 'fix-bpos', answer: 'BPOS', display: 'BPOS',
    topic: 'general', era: 'legacy',
    clues: { easy: 'e14', medium: 'm14', hard: 'h14', pro: 'p14' },
  },
  {
    id: 'fix-conditionalaccess', answer: 'CONDITIONALACCESS', display: 'Conditional Access',
    topic: 'entra', era: 'current',
    clues: { easy: 'e15', medium: 'm15', hard: 'h15', pro: 'p15' },
  },
  {
    id: 'fix-alert', answer: 'ALERT', display: 'Alert',
    topic: 'sentinel', era: 'current',
    clues: { easy: 'e16', medium: 'm16', hard: 'h16', pro: 'p16' },
  },
  {
    id: 'fix-tenant', answer: 'TENANT', display: 'Tenant',
    topic: 'general', era: 'current',
    clues: { easy: 'e17', medium: 'm17', hard: 'h17', pro: 'p17' },
  },
  {
    id: 'fix-policy', answer: 'POLICY', display: 'Policy',
    topic: 'entra', era: 'current',
    clues: { easy: 'e18', medium: 'm18', hard: 'h18', pro: 'p18' },
  },
  {
    id: 'fix-identity', answer: 'IDENTITY', display: 'Identity',
    topic: 'entra', era: 'current',
    clues: { easy: 'e19', medium: 'm19', hard: 'h19', pro: 'p19' },
  },
  {
    id: 'fix-license', answer: 'LICENSE', display: 'License',
    topic: 'general', era: 'current',
    clues: { easy: 'e20', medium: 'm20', hard: 'h20', pro: 'p20' },
  },
];

/**
 * Hostile bank: all answers share no common letters, so only one word can
 * ever be placed. Used to verify termination and partial-grid behavior.
 */
export const HOSTILE_ENTRIES: ClueEntry[] = [
  {
    id: 'hos-a', answer: 'BBB', display: 'B-word',
    topic: 'general', era: 'current',
    clues: { easy: 'hx', medium: 'hx', hard: 'hx', pro: 'hx' },
  },
  {
    id: 'hos-b', answer: 'CCC', display: 'C-word',
    topic: 'general', era: 'current',
    clues: { easy: 'hx', medium: 'hx', hard: 'hx', pro: 'hx' },
  },
  {
    id: 'hos-c', answer: 'DDD', display: 'D-word',
    topic: 'general', era: 'current',
    clues: { easy: 'hx', medium: 'hx', hard: 'hx', pro: 'hx' },
  },
  {
    id: 'hos-d', answer: 'FFF', display: 'F-word',
    topic: 'general', era: 'current',
    clues: { easy: 'hx', medium: 'hx', hard: 'hx', pro: 'hx' },
  },
  {
    id: 'hos-e', answer: 'GGG', display: 'G-word',
    topic: 'general', era: 'current',
    clues: { easy: 'hx', medium: 'hx', hard: 'hx', pro: 'hx' },
  },
];
