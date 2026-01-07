import { PluginListenerHandle, WebPlugin } from '@capacitor/core';

import type { NotificationData, NotificationReaderPlugin } from './definitions';

export class NotificationReaderWeb extends WebPlugin implements NotificationReaderPlugin {
  async requestPermission(): Promise<void> {
    console.warn('Web platform: requestPermission not implemented');
  }

  addListener(
    eventName: 'notificationReceived',
    listenerFunc: (data: NotificationData) => void,
  ): Promise<PluginListenerHandle> {
    console.warn('Web platform: addListener not implemented');
    eventName;
    listenerFunc;

    const handle: PluginListenerHandle = {
      remove: async () => {},
    };

    return Promise.resolve(handle);
  }
}
