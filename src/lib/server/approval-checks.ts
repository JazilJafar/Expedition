import { db } from './db';
import type { ApprovalCheckRow, UserRow } from './database.types';

/**
 * Approvals by a reviewer whose work an admin checks first (users.
 * review_needs_check). Nothing goes to Airtable and no hours are credited
 * until an admin says yes. See supabase/migrations/0049_reviewer_checks.sql.
 */

export type Kind = ApprovalCheckRow['item_kind'];
export type ApprovalCheck = ApprovalCheckRow;

/** Whether this reviewer's approvals wait for an admin. Admins' never do. */
export const needsCheck = (user: UserRow) => user.role !== 'admin' && !!user.review_needs_check;

const asCheck = (c: ApprovalCheck): ApprovalCheck => ({
	...c,
	approved_hours: Number(c.approved_hours),
	tracked_hours: c.tracked_hours === null ? null : Number(c.tracked_hours)
});

export async function listApprovalChecks(): Promise<ApprovalCheck[]> {
	const { data, error } = await db().from('approval_checks').select('*');
	// before the migration: nothing is waiting, and the queue still loads
	if (error) {
		console.error('listApprovalChecks', error.message);
		return [];
	}
	return ((data ?? []) as ApprovalCheck[]).map(asCheck);
}

export async function getApprovalCheck(kind: Kind, key: string): Promise<ApprovalCheck | null> {
	const { data, error } = await db().from('approval_checks').select('*').eq('item_kind', kind).eq('item_key', key).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? asCheck(data as ApprovalCheck) : null;
}

/** Hold an approval for an admin. Approving it again replaces the last one. */
export async function holdForCheck(check: Omit<ApprovalCheck, 'held_at'>): Promise<void> {
	const { error } = await db()
		.from('approval_checks')
		.upsert({ ...check, held_at: new Date().toISOString() }, { onConflict: 'item_kind,item_key' });
	if (error) throw new Error(`Couldn't hold it for an admin's check: ${error.message}`);
}

/**
 * Take a held approval off the list to act on it. Only one request gets it,
 * so pressing yes twice can't send it twice.
 */
export async function takeApprovalCheck(kind: Kind, key: string): Promise<ApprovalCheck | null> {
	const { data, error } = await db().from('approval_checks').delete().eq('item_kind', kind).eq('item_key', key).select('*');
	if (error) throw new Error(error.message);
	const c = (data as ApprovalCheck[] | null)?.[0];
	return c ? asCheck(c) : null;
}

/** Put one back after sending it failed, so it can be tried again. */
export async function restoreApprovalCheck(check: ApprovalCheck): Promise<void> {
	const { error } = await db().from('approval_checks').upsert(check, { onConflict: 'item_kind,item_key' });
	if (error) console.error('restoreApprovalCheck', error.message);
}
