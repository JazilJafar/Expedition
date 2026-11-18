/**
 * Pure helpers for Fjord It RSVPs. The database lives in `$lib/server/fjord`.
 * Identity comes from the signed-in user. Nothing here invents an email.
 */

export type FjordIdentity = {
	name: string;
	email: string;
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Name and email to store, or null when Hack Club Auth gave us no email. */
export function fjordIdentity(user: {
	display_name: string | null;
	email: string | null;
}): FjordIdentity | null {
	const email = user.email?.trim().toLowerCase() ?? '';
	if (!email || email.length > 320 || !EMAIL.test(email)) return null;
	const fromName = user.display_name?.trim().replace(/\s+/g, ' ') ?? '';
	const local = email.split('@')[0] ?? '';
	const name = (fromName || local).slice(0, 80);
	if (!name) return null;
	return { name, email };
}

function csvCell(value: string): string {
	// A cell that starts with one of these can become a formula in a spreadsheet.
	let safe = value;
	if (/^[=+\-@\t\r]/.test(safe)) safe = `'${safe}`;
	if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
	return safe;
}

/** name, email, timestamp, and a count of the rows in this file. */
export function fjordCsv(rows: { name: string; email: string; created_at: string }[]): string {
	const lines = [
		`count,${rows.length}`,
		'name,email,rsvped_at',
		...rows.map((row) => [csvCell(row.name), csvCell(row.email), csvCell(row.created_at)].join(','))
	];
	return '\uFEFF' + lines.join('\n') + '\n';
}
