import { db } from './db';
import type { FraudCheckRow } from './database.types';

/**
 * Approvals sent to a fraud check instead of straight to Hack Club. Nothing
 * goes to Airtable and no hours are credited until an admin clears it. A
 * cleared one stays, marked, so reviewers can see it was checked.
 * See supabase/migrations/0048_fraud_checks.sql.
 */

export type Kind = FraudCheckRow['item_kind'];
export type FraudCheck = FraudCheckRow;

const asCheck = (c: FraudCheck): FraudCheck => ({
	...c,
	approved_hours: Number(c.approved_hours),
	tracked_hours: c.tracked_hours === null ? null : Number(c.tracked_hours)
});

export async function listFraudChecks(): Promise<FraudCheck[]> {
	const { data, error } = await db().from('fraud_checks').select('*');
	// before the fraud-checks migration: nothing is held, and the queue still loads
	if (error) {
		console.error('listFraudChecks', error.message);
		return [];
	}
	return ((data ?? []) as FraudCheck[]).map(asCheck);
}

/**
 * Whether the fraud_checks table is there to hold anything. Before the
 * migration (or before PostgREST is restarted to pick it up) it isn't, and
 * sending to a fraud check has to say so rather than half-save.
 */
export async function fraudChecksReady(): Promise<boolean> {
	const { error } = await db().from('fraud_checks').select('item_key, cleared_at, sent_as').limit(1);
	if (error) console.error('fraudChecksReady', error.message);
	return !error;
}

export async function getFraudCheck(kind: Kind, key: string): Promise<FraudCheck | null> {
	return (await listFraudChecks()).find((c) => c.item_kind === kind && c.item_key === key) ?? null;
}

/** Hold an approval for a fraud check. Sending it again replaces the last one. */
export async function holdForFraudCheck(check: Omit<FraudCheck, 'held_at' | 'cleared_by' | 'cleared_at' | 'sent_as'>): Promise<void> {
	const { error } = await db()
		.from('fraud_checks')
		.upsert(
			{ ...check, held_at: new Date().toISOString(), cleared_by: null, cleared_at: null, sent_as: null },
			{ onConflict: 'item_kind,item_key' }
		);
	if (error) throw new Error(error.message);
}

/**
 * Mark a held approval cleared to act on it. Only one request gets it, so
 * two people pressing yes at once can't send it twice.
 */
export async function clearFraudCheck(kind: Kind, key: string, clearedBy: string): Promise<FraudCheck | null> {
	const { data, error } = await db()
		.from('fraud_checks')
		.update({ cleared_by: clearedBy, cleared_at: new Date().toISOString() })
		.eq('item_kind', kind)
		.eq('item_key', key)
		.is('cleared_at', null)
		.select('*');
	if (error) throw new Error(error.message);
	const c = (data as FraudCheck[] | null)?.[0];
	return c ? asCheck(c) : null;
}

/** Take a held approval off the list altogether, when it fails the check. */
export async function dropFraudCheck(kind: Kind, key: string): Promise<boolean> {
	const { data, error } = await db()
		.from('fraud_checks')
		.delete()
		.eq('item_kind', kind)
		.eq('item_key', key)
		.is('cleared_at', null)
		.select('item_key');
	if (error) throw new Error(error.message);
	return !!data?.length;
}

/** A cleared 'new' one, once sent: which Airtable record it became. */
export async function noteFraudCheckSent(key: string, airtableRecordId: string): Promise<void> {
	const { error } = await db().from('fraud_checks').update({ sent_as: airtableRecordId }).eq('item_kind', 'new').eq('item_key', key);
	if (error) console.error('noteFraudCheckSent', error.message);
}

/** Back to waiting after sending it failed, so it can be tried again. */
export async function unclearFraudCheck(kind: Kind, key: string): Promise<void> {
	const { error } = await db().from('fraud_checks').update({ cleared_by: null, cleared_at: null }).eq('item_kind', kind).eq('item_key', key);
	if (error) console.error('unclearFraudCheck', error.message);
}
