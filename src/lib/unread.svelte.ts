import { getUnreadChatCount, getUnreadNotificationsCount } from './data/api';
import { onTableChange } from './realtime';

// Unread counters shown in the drawer (CommonDrawerController's
// globalNotifications / messageNotifications), kept fresh over realtime.
let notifications = $state(0);
let messages = $state(0);

let stop: (() => void) | null = null;
let debounce: ReturnType<typeof setTimeout> | undefined;

async function refreshNotifications(userId: string) {
	notifications = await getUnreadNotificationsCount(userId).catch(() => notifications);
}

async function refreshMessages(userId: string) {
	messages = await getUnreadChatCount(userId).catch(() => messages);
}

export const unread = {
	get notifications(): number {
		return notifications;
	},
	get messages(): number {
		return messages;
	},
	refreshNotifications,
	refreshMessages,

	/** Loads both counts and follows realtime changes for this user. */
	start(userId: string): void {
		stop?.();
		refreshNotifications(userId);
		refreshMessages(userId);

		const offNotifications = onTableChange('notifications', (change) => {
			if (change.event !== 'DELETE' && change.newRow.receiver !== userId) return;
			refreshNotifications(userId);
		});
		const offMessages = onTableChange('messages', (change) => {
			if (change.event === 'DELETE' || change.newRow.receiver !== userId) return;
			clearTimeout(debounce);
			debounce = setTimeout(() => refreshMessages(userId), 500);
		});
		stop = () => {
			offNotifications();
			offMessages();
		};
	},

	stop(): void {
		stop?.();
		stop = null;
		notifications = 0;
		messages = 0;
	}
};
