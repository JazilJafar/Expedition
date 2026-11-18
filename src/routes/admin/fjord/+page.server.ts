import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/guards';
import { listFjordRsvps } from '$lib/server/fjord';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);
	try {
		const rsvps = await listFjordRsvps();
		return { ready: true as const, rsvps, count: rsvps.length, message: null };
	} catch (e) {
		return {
			ready: false as const,
			rsvps: [],
			count: 0,
			message: e instanceof Error ? e.message : 'Database error'
		};
	}
};
