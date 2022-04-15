const tracking = (id) => {
  axios
    .get(`api/1.0/subscription/tracking?id=${id}`)
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
};

class SubscriptionGenerator {
  constructor(serviceWorkerPath) {
    this.serviceWorkerPath = serviceWorkerPath;
  }
  async init() {
    await navigator.serviceWorker.register(this.serviceWorkerPath);
    this.sw = await navigator.serviceWorker.ready;
  }
  async askPermission() {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (result) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    }).then(function (permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error("We weren't granted permission.");
      }
    });
  }
  async getSubscription() {
    const subscription = await this.sw.pushManager.getSubscription();
    return subscription || '';
  }
  async subscribe(publicKey, userVisibleOnly) {
    const subscriptionOptions = {};
    if (!publicKey) {
      throw new Error('Invalid publicKey');
    }
    subscriptionOptions.applicationServerKey = new urlBase64ToUint8Array(publicKey);
    subscriptionOptions.userVisibleOnly = userVisibleOnly || false;

    return this.sw.pushManager.subscribe(subscriptionOptions);
  }
  async unsubscribe() {
    const subscription = await this.getSubscription();
    if (!subscription) {
      return;
    }
    await subscription.unsubscribe();
    try {
      const res = await axios.delete(
        '/api/1.0/subscription',
        { data: { endpoint: subscription.endpoint } },
        { headers: { 'content-type': 'application/json' } }
      );
      return console.log('Successfully unsubscribe to server, id:' + res.data.status);
    } catch (err) {
      return console.log(err);
    }
  }
}

const socket = io({ transports: ['websocket', 'polling'] });
socket.on('connection', (data) => {
  console.log('Connect socket io server', data);
});
socket.on('push', (data) => {
  console.log('Receive notification from socket:', data);
  tracking(data.notification_id);
});

const newSubscription = new SubscriptionGenerator('notify-sw.js');

$('#subscribe').click(async function (event) {
  event.preventDefault();
  const channelID = $('#channel-id').val();
  const publicKey = $('#public-key').val();
  socket.emit('subscribe', { channel_id: channelID });

  if (!'serviceWorker' in navigator) {
    throw new Error('Service Worker Is Not Supportted');
  }

  await newSubscription.askPermission();
  await newSubscription.init();
  console.log(newSubscription);

  const channel = new BroadcastChannel('Notify-sw');
  channel.addEventListener('message', (event) => {
    console.log('Received', event.data);
    if (event.data.title === 'auth') {
      axios
        .get(`api/1.0/subscription/verify?code=${event.data.code}`)
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
      return;
    }
    tracking(event.data.notification_id);
  });
  let subscription = await newSubscription.getSubscription();
  if (subscription) {
    return console.log('Subscription already exist\n' + JSON.stringify(subscription));
  }
  subscription = await newSubscription.subscribe(publicKey, true);
  console.log(publicKey);
  console.log(channelID);
  try {
    const res = await axios.post('/api/1.0/subscription', { channel_id: channelID, subscription }, { headers: { 'content-type': 'application/json' } });
    return console.log('Successfully subscribe to server' + res.data);
  } catch (err) {
    return console.log(err);
  }
});

$('#unsubscribe').click(async function (event) {
  event.preventDefault();
  await newSubscription.unsubscribe();
  console.log('Unsubscribe!');
});

$('#realtime').click(async function (event) {
  event.preventDefault();
  const channelID = $('#channel-id').val();
  const title = $('#notification-title').val();
  const body = $('#notification-body').val();
  const sendType = $('#notification-send-type').val();
  const ttl = $('#notification-ttl').val();
  const icon = $('#notification-icon').val();
  try {
    const res = await axios.post(
      '/api/1.0/notifications/realtime',
      { channel_id: channelID, title, body, sendType, config: { ttl, icon } },
      { headers: { 'content-type': 'application/json' } }
    );
    console.log('Push success!');
  } catch (err) {
    console.log(err);
  }
});

$('#scheduled').click(async function (event) {
  event.preventDefault();
  const channelID = $('#channel-id').val();
  const title = $('#notification-title').val();
  const body = $('#notification-body').val();
  const sendType = $('#notification-send-type').val();
  const ttl = $('#notification-ttl').val();
  const icon = $('#notification-icon').val();
  const date = $('#notification-date').val();
  const time = $('#notification-time').val();
  const sendTime = new Date(date + ' ' + time);
  try {
    const res = await axios.post(
      '/api/1.0/notifications/scheduled',
      { channel_id: channelID, title, body, sendType, config: { ttl, icon }, sendTime },
      { headers: { 'content-type': 'application/json' } }
    );
    console.log('Push success', res);
  } catch (err) {
    console.log(err);
  }
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
