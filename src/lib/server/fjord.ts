import type { Cookies } from '@sveltejs/kit';
import { fjordIdentity } from '$lib/fjord';
import { db } from './db';
import type { FjordRsvpRow, UserRow } from './database.types';

/** Set when a signed-out visitor clicks RSVP, consumed after Hack Club Auth. */
export const FJORD_COOKIE = 'fjord_rsvp';

const cookieOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: process.env.NODE_ENV === 'production',
	maxAge: 30 * 60
};

export class FjordError extends Error {
	constructor(readonly code: 'no-email') {
		super(code);
	}
}

export function rememberFjordIntent(cookies: Cookies): void {
	cookies.set(FJORD_COOKIE, '1', cookieOptions);
}

export function clearFjordIntent(cookies: Cookies): void {
	cookies.delete(FJORD_COOKIE, { path: '/' });
}

const COLUMNS = 'user_id, name, email, created_at';

export async function getFjordRsvp(userId: string): Promise<FjordRsvpRow | null> {
	const { data, error } = await db().from('fjord_rsvps').select(COLUMNS).eq('user_id', userId).maybeSingle();
	if (error) throw new Error(error.message);
	return (data as FjordRsvpRow | null) ?? null;
}

/**
 * Record this user's RSVP. A second call returns the original row and does
 * not move the timestamp.
 */
export async function rsvpFjord(user: UserRow): Promise<FjordRsvpRow> {
	const identity = fjordIdentity(user);
	if (!identity) throw new FjordError('no-email');

	const existing = await getFjordRsvp(user.id);
	if (existing) return existing;

	const { error } = await db().from('fjord_rsvps').insert({
		user_id: user.id,
		name: identity.name,
		email: identity.email
	});
	if (error) {
		const again = await getFjordRsvp(user.id).catch(() => null);
		if (again) return again;
		throw new Error(error.message);
	}

	const row = await getFjordRsvp(user.id);
	if (!row) throw new Error('RSVP did not save');
	return row;
}

export async function listFjordRsvps(): Promise<FjordRsvpRow[]> {
	const { data, error } = await db()
		.from('fjord_rsvps')
		.select(COLUMNS)
		.order('created_at', { ascending: false });
	if (error) throw new Error(error.message);
	return (data ?? []) as FjordRsvpRow[];
}
