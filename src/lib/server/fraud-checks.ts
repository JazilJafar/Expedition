import { db } from './db';
import type { FraudCheckRow } from './database.types';

/**
 * Approvals sent to a fraud check instead of straight to Hack Club. Nothing
 * goes to Airtable and no hours are credited until a different reviewer
 * clears it. See supabase/migrations/0048_fraud_checks.sql.
 */

export type Kind = FraudCheckRow['item_kind'];
export type FraudCheck = FraudCheckRow;

export async function listFraudChecks(): Promise<FraudCheck[]> {
	const { data, error } = await db().from('fraud_checks').select('*');
	// before the fraud-checks migration: nothing is held, and the queue still loads
	if (error) {
		console.error('listFraudChecks', error.message);
		return [];
	}
	return ((data ?? []) as FraudCheck[]).map((c) => ({
		...c,
		approved_hours: Number(c.approved_hours),
		tracked_hours: c.tracked_hours === null ? null : Number(c.tracked_hours)
	}));
}

export async function getFraudCheck(kind: Kind, key: string): Promise<FraudCheck | null> {
	return (await listFraudChecks()).find((c) => c.item_kind === kind && c.item_key === key) ?? null;
}

/** Hold an approval for a fraud check. Sending it again replaces the last one. */
export async function holdForFraudCheck(check: Omit<FraudCheck, 'held_at'>): Promise<void> {
	const { error } = await db()
		.from('fraud_checks')
		.upsert({ ...check, held_at: new Date().toISOString() }, { onConflict: 'item_kind,item_key' });
	if (error) throw new Error(error.message);
}

/**
 * Take a held approval off the list to act on it. Only one request gets it,
 * so two people pressing yes at once can't send it twice.
 */
export async function takeFraudCheck(kind: Kind, key: string): Promise<FraudCheck | null> {
	const { data, error } = await db().from('fraud_checks').delete().eq('item_kind', kind).eq('item_key', key).select('*');
	if (error) throw new Error(error.message);
	const c = (data as FraudCheck[] | null)?.[0];
	return c ? { ...c, approved_hours: Number(c.approved_hours), tracked_hours: c.tracked_hours === null ? null : Number(c.tracked_hours) } : null;
}

/** Put one back after sending it failed, so it can be tried again. */
export async function restoreFraudCheck(check: FraudCheck): Promise<void> {
	const { error } = await db().from('fraud_checks').upsert(check, { onConflict: 'item_kind,item_key' });
	if (error) console.error('restoreFraudCheck', error.message);
}
