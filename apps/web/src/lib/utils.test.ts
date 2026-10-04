import { expect, test } from 'bun:test';
import { timeAgo } from './utils';

test('timeAgo picks the largest whole unit', () => {
	const now = Date.parse('2026-10-04T12:00:00Z');
	const ago = (seconds: number) => timeAgo(new Date(now - seconds * 1000), now);
	expect(ago(10)).toBe('just now');
	expect(ago(5 * 60)).toBe('5 minutes ago');
	expect(ago(3 * 3600)).toBe('3 hours ago');
	expect(ago(86_400)).toBe('yesterday');
	expect(ago(15 * 86_400)).toBe('2 weeks ago');
	expect(ago(400 * 86_400)).toBe('last year');
});
