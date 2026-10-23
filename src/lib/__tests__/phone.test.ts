import { describe, it, expect } from 'vitest';
import { normalizePhone, maskPhone } from '../phone';

describe('normalizePhone', () => {
  it.each([
    ['+55 (12) 98803-6103', '12988036103'],
    ['012 98803 6103', '12988036103'],
    ['12 3123-4567', '1231234567'],
  ])('%s → %s', (input, expected) => expect(normalizePhone(input)).toBe(expected));

  it.each(['98803-6103', '', '(12) 88803-6103'])('%s → null', (input) => expect(normalizePhone(input)).toBeNull());
});

describe('maskPhone', () => {
  it.each([
    ['1', '(1'],
    ['129', '(12) 9'],
    ['1298803', '(12) 9880-3'],
    ['12988036103', '(12) 98803-6103'],
    ['1231234567', '(12) 3123-4567'],
  ])('%s → %s', (input, expected) => expect(maskPhone(input)).toBe(expected));
});
