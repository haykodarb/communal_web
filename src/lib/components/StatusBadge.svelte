<script lang="ts" module>
	/**
	 * available / returned: green, loaned: purple (BookCard's colours),
	 * requested: primary, rejected: error.
	 */
	export type StatusTone = 'available' | 'loaned' | 'requested' | 'rejected';
</script>

<script lang="ts">
	// A status as a small tinted chip with a coloured dot (book and loan pages).
	let { tone, label }: { tone: StatusTone; label: string } = $props();
</script>

<span class="badge {tone}"><span class="dot"></span>{label}</span>

<style>
	.badge {
		--tone: #7dae6b;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 24px;
		padding: 0 10px;
		border-radius: 12px;
		vertical-align: middle;
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		background: color-mix(in srgb, var(--tone) 22%, transparent);
	}
	.badge.loaned {
		--tone: var(--tertiary);
	}
	.badge.requested {
		--tone: var(--primary);
	}
	.badge.rejected {
		--tone: var(--error);
	}
	.dot {
		width: 7px;
		height: 7px;
		flex: 0 0 7px;
		border-radius: 50%;
		background: var(--tone);
	}
</style>
