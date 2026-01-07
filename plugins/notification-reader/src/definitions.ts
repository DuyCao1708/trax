import { PluginListenerHandle } from "@capacitor/core";

export interface NotificationReaderPlugin {
  requestPermission(): Promise<void>;

  addListener(
    eventName: 'notificationReceived',
    listenerFunc: (data: NotificationData) => void
  ): Promise<PluginListenerHandle>;
}

export interface NotificationData {
  packageName: string;
  title?: string;
  text?: string;
}