package trax.notificationreader;

import android.content.Intent;
import android.provider.Settings;
import android.text.TextUtils;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import androidx.activity.result.ActivityResult;

@CapacitorPlugin(name = "NotificationReader")
public class NotificationReaderPlugin extends Plugin {

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (!isNotificationServiceEnabled()) {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            startActivityForResult(call, intent, "permissionResult");
        } else {
            call.resolve(); 
        }
    }

    private boolean isNotificationServiceEnabled() {
        String enabledListeners = Settings.Secure.getString(
            getContext().getContentResolver(),
            "enabled_notification_listeners"
        );
        return !TextUtils.isEmpty(enabledListeners) &&
            enabledListeners.contains(getContext().getPackageName());
    }

    @ActivityCallback
    private void permissionResult(PluginCall call, ActivityResult result) {
        if (isNotificationServiceEnabled()) {
            call.resolve(); // người dùng bật quyền
        } else {
            call.reject("Notification access not granted");
        }
    }

    @Override
    public void load() {
        super.load();
        // đăng ký plugin cho NotificationListener
        NotificationListener.setPlugin(this);
    }

    public void sendNotificationToJS(JSObject data) {
        // gọi protected notifyListeners từ bên trong plugin
        this.notifyListeners("notificationReceived", data);
    }
}
