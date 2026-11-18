import { redirect, type RequestHandler } from '@sveltejs/kit';
import { clearFjordIntent, FJORD_COOKIE, rememberFjordIntent, rsvpFjord } from '$lib/server/fjord';

/**
 * Signed-out RSVP. A click lands here, we remember the intent, and Hack Club
 * Auth sends them back. The callback records the RSVP. This GET only writes
 * when that intent cookie is still set, so a stray visit while signed in
 * does not RSVP anyone.
 */
export const GET: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.user) {
		rememberFjordIntent(cookies);
		redirect(303, '/auth/login?next=/fjord/rsvp');
	}

	if (cookies.get(FJORD_COOKIE) === '1') {
		try {
			await rsvpFjord(locals.user);
		} catch (e) {
			console.error('fjord rsvp', e);
		}
		clearFjordIntent(cookies);
	}

	redirect(303, '/dashboard');
};
