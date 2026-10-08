export type ToastKind = 'info' | 'error';

export interface ToastItem {
	id: number;
	message: string;
	kind: ToastKind;
}

/** How long a toast stays up before it auto-dismisses, per kind (ms). */
const DURATION: Record<ToastKind, number> = { info: 3000, error: 4500 };

/** At most this many stack at once; the oldest is dropped for a new one. */
const MAX_VISIBLE = 3;

let items = $state<ToastItem[]>([]);
let nextId = 0;

function dismiss(id: number): void {
	items = items.filter((item) => item.id !== id);
}

// A tiny toast queue for one-shot success/error feedback (save, delete,
// request...), shown by the root layout's <Toasts> inside an aria-live
// region. Kept simple: stack a few, auto-dismiss each on its own timer.
export const toast = {
	get items() {
		return items;
	},
	show(message: string, { kind = 'info' }: { kind?: ToastKind } = {}): number {
		const id = nextId++;
		items = [...items.slice(-(MAX_VISIBLE - 1)), { id, message, kind }];
		setTimeout(() => dismiss(id), DURATION[kind]);
		return id;
	},
	dismiss
};
