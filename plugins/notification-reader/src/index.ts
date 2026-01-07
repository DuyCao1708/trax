import { registerPlugin } from '@capacitor/core';

import type { NotificationReaderPlugin } from './definitions';

const NotificationReader = registerPlugin<NotificationReaderPlugin>('NotificationReader', {
  web: () => import('./web').then((m) => new m.NotificationReaderWeb()),
});

export * from './definitions';
export { NotificationReader };
