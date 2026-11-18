import { describe, expect, it } from 'vitest';
import { fjordCsv, fjordIdentity } from './fjord';

describe('fjord identity', () => {
	it('uses the signed-in name and lowercases the email', () => {
		expect(fjordIdentity({ display_name: 'Ada  Lovelace', email: 'Ada@HackClub.com' })).toEqual({
			name: 'Ada Lovelace',
			email: 'ada@hackclub.com'
		});
	});

	it('falls back to the mailbox name when display name is blank', () => {
		expect(fjordIdentity({ display_name: '   ', email: 'fjord@example.com' })).toEqual({
			name: 'fjord',
			email: 'fjord@example.com'
		});
	});

	it('refuses an account with no email', () => {
		expect(fjordIdentity({ display_name: 'Ada', email: null })).toBeNull();
		expect(fjordIdentity({ display_name: 'Ada', email: 'not-an-email' })).toBeNull();
	});
});

describe('fjord csv', () => {
	it('includes the count, name, email and timestamp', () => {
		const csv = fjordCsv([
			{ name: 'Ada', email: 'ada@example.com', created_at: '2026-11-18T15:00:00.000Z' },
			{ name: 'Bea, Jr', email: 'bea@example.com', created_at: '2026-11-18T16:00:00.000Z' }
		]);
		expect(csv.startsWith('\uFEFF')).toBe(true);
		expect(csv).toContain('count,2');
		expect(csv).toContain('name,email,rsvped_at');
		expect(csv).toContain('Ada,ada@example.com,2026-11-18T15:00:00.000Z');
		expect(csv).toContain('"Bea, Jr",bea@example.com,2026-11-18T16:00:00.000Z');
	});

	it('neutralises a formula-looking name', () => {
		const csv = fjordCsv([{ name: '=cmd', email: 'a@example.com', created_at: '2026-11-18T15:00:00.000Z' }]);
		expect(csv).toContain("'=cmd");
	});
});
