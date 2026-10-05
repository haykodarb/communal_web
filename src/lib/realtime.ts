import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Port of RealtimeBackend: one channel for every change in the public schema
// (RLS decides what reaches this user), fanned out to listeners by table.

export interface RealtimeChange {
	table: string;
	event: 'INSERT' | 'UPDATE' | 'DELETE';
	newRow: Record<string, unknown>;
	oldRow: Record<string, unknown>;
}

type Listener = (change: RealtimeChange) => void;

const listeners = new Set<Listener>();
let channel: RealtimeChannel | null = null;

function dispatch(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) {
	const change: RealtimeChange = {
		table: payload.table,
		event: payload.eventType,
		newRow: (payload.new ?? {}) as Record<string, unknown>,
		oldRow: (payload.old ?? {}) as Record<string, unknown>
	};
	if (Object.keys(change.newRow).length === 0 && Object.keys(change.oldRow).length === 0) return;
	for (const listener of listeners) listener(change);
}

export function subscribeToDatabaseChanges(): void {
	if (channel) return;
	channel = supabase
		.channel('all', { config: { broadcast: { self: true } } })
		.on('postgres_changes', { event: '*', schema: 'public' }, dispatch)
		.subscribe((status, error) => {
			if (status !== 'SUBSCRIBED') console.warn('[realtime]', status, error ?? '');
		});
}

export async function unsubscribeFromDatabase(): Promise<void> {
	if (!channel) return;
	// Clear it before awaiting so an immediate re-subscribe opens a new channel.
	const closing = channel;
	channel = null;
	await supabase.removeChannel(closing);
}

/** Listen to changes on one table; returns an unsubscribe function (usable as an $effect cleanup). */
export function onTableChange(table: string, listener: Listener): () => void {
	const wrapped: Listener = (change) => {
		if (change.table === table) listener(change);
	};
	listeners.add(wrapped);
	return () => listeners.delete(wrapped);
}
