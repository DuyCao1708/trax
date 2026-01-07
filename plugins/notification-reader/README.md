# notification-reader

Capacitor plugin to read notifications

## Install

```bash
npm install notification-reader
npx cap sync
```

## API

<docgen-index>

* [`requestPermission()`](#requestpermission)
* [`addListener('notificationReceived', ...)`](#addlistenernotificationreceived-)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### requestPermission()

```typescript
requestPermission() => Promise<void>
```

--------------------


### addListener('notificationReceived', ...)

```typescript
addListener(eventName: 'notificationReceived', listenerFunc: (data: NotificationData) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code>'notificationReceived'</code>                                              |
| **`listenerFunc`** | <code>(data: <a href="#notificationdata">NotificationData</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### NotificationData

| Prop              | Type                |
| ----------------- | ------------------- |
| **`packageName`** | <code>string</code> |
| **`title`**       | <code>string</code> |
| **`text`**        | <code>string</code> |

</docgen-api>
