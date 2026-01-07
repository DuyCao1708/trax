package trax.notificationreader;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import com.getcapacitor.JSObject;

public class NotificationListener extends NotificationListenerService {

    private static NotificationReaderPlugin plugin;

    @Override
    public void onCreate() {
        super.onCreate();
    }

    public static void setPlugin(NotificationReaderPlugin pluginInstance) {
        plugin = pluginInstance;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (plugin != null) {
            JSObject data = new JSObject();
            data.put("packageName", sbn.getPackageName());
            if (sbn.getNotification().extras != null) {
            data.put("title", sbn.getNotification().extras.getString("android.title"));
            CharSequence text = sbn.getNotification().extras.getCharSequence("android.text");
            data.put("text", text != null ? text.toString() : "");
        }
        
        // gọi method public của plugin
        plugin.sendNotificationToJS(data);
    }
  }
}
