import type { RequestHandler } from './$types';
import { fjordCsv } from '$lib/fjord';
import { requireAdmin } from '$lib/server/guards';
import { listFjordRsvps } from '$lib/server/fjord';

export const GET: RequestHandler = async ({ locals }) => {
	requireAdmin(locals);
	const rows = await listFjordRsvps();
	return new Response(fjordCsv(rows), {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="fjord-it-rsvps.csv"',
			'cache-control': 'private, no-store'
		}
	});
};
