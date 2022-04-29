const tracking = (id) => {
  axios
    .get(`api/1.0/subscription/tracking?id=${id}`)
    .then((res) => console.log('Result from tracking notification', res.data))
    .catch((err) => console.log(err));
};

const channel = new BroadcastChannel('Notify-sw');
channel.addEventListener('message', (event) => {
  console.log('[Webpush] Receive data:', event.data);
  if (event.data.title === 'auth') {
    toastr.info('Auth', 'Successfully suscribe to Web-Push server');
    axios
      .get(`api/1.0/subscription/verify?code=${event.data.code}`)
      .then((res) => console.log('[Webpush] Receive verification:', res.data))
      .catch((err) => console.log(err));
    return;
  }
  toastr.info(event.data.title, event.data.body);
  tracking(event.data.notification_id);
});

class Notifier {
  constructor(channelId, serviceWorkerPath) {
    this.channelId = channelId;
    this.serviceWorkerPath = serviceWorkerPath;
    this.serviceWorkerstatus = 0;
  }
  async init() {
    // Initialize websocket client
    if (this.socket) {
      this.socket.connect();
      console.log('[Websocket] Websocket client connect');
    } else {
      const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
      socket.on('connection', (data) => {
        console.log('[Websocket] Receive:', data);
      });
      socket.on('push', (data) => {
        console.log('[Websocket] Receive:', data);
        if (data.title) {
          toastr.success(data.title, data.body);
        }
        tracking(data.notification_id);
      });
      this.socket = socket;
      console.log('[Websocket] Initialize websocket client');
    }

    // Initialize && Register service worker
    try {
      const permissionStatus = await Notification.requestPermission();
      if (permissionStatus !== 'granted') {
        return Promise.reject('[Webpush] Not allowed notification permission');
      }
      await navigator.serviceWorker.register(this.serviceWorkerPath);
      this.sw = await navigator.serviceWorker.ready;
      this.serviceWorkerstatus = 1;
      console.log('[Webpush] Successfully register service worker');
      return Promise.resolve();
    } catch (err) {
      console.log('Register service worker error');
    }
  }

  async unregister() {
    // Close websocket connection
    if (this.socket) {
      this.socket.disconnect();
      console.log('[Websocket] Successfully unregister socket connection');
    }

    // Unregister service worker
    if (!this.serviceWorkerstatus) {
      return console.log('[Webpush] No service worker to unregister');
    }
    const registrations = await navigator.serviceWorker.getRegistrations();
    registrations.forEach((registration) => {
      registration.unregister();
    });
    this.serviceWorkerstatus = 0;
    return console.log('[Webpush] Successfully unregister service worker');
  }
  async getSubscription() {
    if (!this.serviceWorkerstatus) {
      return console.log('[Webpush] No service worker!');
    }
    const subscription = await this.sw.pushManager.getSubscription();
    return subscription || '';
  }
  async subscribe(publicKey, userVisibleOnly) {
    const channel_id = this.channelId;
    // Subscribe to websocket server
    this.socket.emit('subscribe', { channel_id });
    console.log('[Websocket] Successfully subscribe to websocket server');

    // Subscribe to webpush server
    if (!this.serviceWorkerstatus) {
      return console.log('[Webpush] No service worker!');
    }

    const subscriptionOptions = {};
    if (!publicKey) {
      return console.log('Invalid publicKey');
    }
    subscriptionOptions.applicationServerKey = new urlBase64ToUint8Array(publicKey);
    subscriptionOptions.userVisibleOnly = userVisibleOnly || false;
    try {
      const subscription = await this.sw.pushManager.subscribe(subscriptionOptions);
      console.log('[Webpush] Successfully subscribe to webpush server');
      const res = await axios.post('/api/1.0/subscription', { channel_id, subscription }, { headers: { 'content-type': 'application/json' } });
      return console.log('[Webpush] Send subscription to server, ', res.data);
    } catch (err) {
      return console.log(err);
    }
  }
  async unsubscribe() {
    // Unsubscribe to websocket server
    const channel_id = this.channelId;
    this.socket.emit('unsubscribe', { channel_id });

    // Unsubscribe to websocket server
    if (!this.sw) {
      return console.log('[Webpush] no service worker');
    }
    const subscription = await this.getSubscription();
    if (!subscription) {
      return console.log('[Webpush] no subscription');
    }
    await subscription.unsubscribe();
    try {
      const res = await axios.delete(
        '/api/1.0/subscription',
        { data: { endpoint: subscription.endpoint } },
        { headers: { 'content-type': 'application/json' } }
      );
      return console.log('[Webpush] Successfully unsubscribe to server,', res.data);
    } catch (err) {
      return console.log(err);
    }
  }
  async addTag(tag) {
    const subscription = await this.getSubscription();
    if (!subscription) {
      return console.log('[Webpush] no subscription');
    }
    try {
      const res = await axios.post(
        '/api/1.0//subscription/tag',
        { channel_id: this.channelId, endpoint: subscription.endpoint, tag },
        { headers: { 'content-type': 'application/json' } }
      );
      return console.log('[Webpush] Successfully add tag,', res.data);
    } catch (err) {
      return console.log(err);
    }
  }

  async removeTag() {
    const subscription = await this.getSubscription();
    if (!subscription) {
      return console.log('[Webpush] no subscription');
    }
    try {
      const res = await axios.delete(
        '/api/1.0//subscription/tag',
        { data: { channel_id: this.channelId, endpoint: subscription.endpoint } },
        { headers: { 'content-type': 'application/json' } }
      );
      return console.log('[Webpush] Successfully remove tag,', res.data);
    } catch (err) {
      return console.log(err);
    }
  }
}
let myNotifier;
// $('#initial').click(async (event) => {
//   event.preventDefault();
//   const channelId = $('#channel-id').val();
//   myNotifier = new Notifier(channelId, 'notify-sw.js');
//   await myNotifier.init();
// });

// $('#unregister').click(async (event) => {
//   event.preventDefault();
//   await myNotifier.unregister();
// });

$('#subscribe').click(async function (event) {
  event.preventDefault();
  const channelId = $('#channel-id').val();
  myNotifier = new Notifier(channelId, 'notify-sw.js');
  await myNotifier.init();
  const publicKey = $('#public-key').val();
  try {
    // let subscription = await myNotifier.getSubscription();
    // if (subscription) {
    //   return console.log('Subscription already exist\n' + JSON.stringify(subscription));
    // }
    await myNotifier.subscribe(publicKey, true);
  } catch (error) {
    console.log(error);
  }

  // console.log(publicKey);
  // try {
  //   const res = await axios.post('/api/1.0/subscription', { channel_id: channelID, subscription }, { headers: { 'content-type': 'application/json' } });
  //   return console.log('Successfully subscribe to server, ' + res.data);
  // } catch (err) {
  //   return console.log(err);
  // }
});

$('#unsubscribe').click(async function (event) {
  event.preventDefault();
  await myNotifier.unsubscribe();
});

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
