// From your client pages:
const channel = new BroadcastChannel('Notify-sw');
channel.addEventListener('message', (event) => {
  console.log('Received', event.data);
});

function SubscriptionGenerator() {}

SubscriptionGenerator.prototype.init = async function () {
  this.sw = await navigator.serviceWorker.ready;
};

SubscriptionGenerator.prototype.getSubscription = async function () {
  const subscription = await this.sw.pushManager.getSubscription();
  return subscription || '';
};

SubscriptionGenerator.prototype.subscribe = async function (publicKey, userVisibleOnly) {
  const subscriptionOptions = {};

  if (!publicKey) {
    throw new Error('Invalid publicKey');
  }
  subscriptionOptions.applicationServerKey = new urlBase64ToUint8Array(publicKey);
  subscriptionOptions.userVisibleOnly = userVisibleOnly || false;

  return this.sw.pushManager.subscribe(subscriptionOptions);
};

// Unsubscribes any existing push subscription from the |source|, which must be either 'document' or
// 'service-worker'. Returns a promise that will be resolved when unsubscription has finished.
SubscriptionGenerator.prototype.unsubscribe = async function () {
  const subscription = await this.getSubscription();
  if (subscription) {
    return subscription.unsubscribe();
  }
  return Promise.resolve();
};
const mySubscription = new SubscriptionGenerator();
$(document).ready(async () => {
  // Register a Service Worker.
  let sw = await navigator.serviceWorker.register('notify-sw.js');
  await mySubscription.init();
  console.log(mySubscription);
});

$('#subscribe').click(async function (event) {
  event.preventDefault();
  let subscription = await mySubscription.getSubscription();
  if (subscription) {
    return console.log('Subscription already exist\n' + JSON.stringify(subscription));
  }
  const appID = $('#app-id').val();
  const publicKey = $('#public-key').val();
  console.log('appID', appID);
  console.log('publicKey', publicKey);
  subscription = await mySubscription.subscribe(publicKey, true);
  console.log('Successfully get subscription\n' + JSON.stringify(subscription));
  try {
    const res = await axios.post('/api/1.0/subscribe', { app_id: appID, subscription: subscription }, { headers: { 'content-type': 'application/json' } });
    return console.log('Successfully subscribe to server, id:' + res.data.id);
  } catch (err) {
    return console.log(err);
  }
});

$('#unsubscribe').click(async function (event) {
  event.preventDefault();
  await mySubscription.unsubscribe();
  console.log('Unsubscribe!');
});

$('#realtime').click(async function (event) {
  event.preventDefault();
  const appID = $('#app-id').val();
  const title = $('#notification-title').val();
  const message = $('#notification-message').val();
  const sendType = $('#notification-send-type').val();
  const ttl = $('#notification-ttl').val();
  try {
    const res = await axios.post('/api/1.0/push/realtime', { appID, payload: { title, message }, sendType, ttl }, { headers: { 'content-type': 'application/json' } });
    console.log(res.data);
  } catch (err) {
    console.log(err);
  }
});

$('#scheduled').click(async function (event) {
  event.preventDefault();
  const appID = $('#app-id').val();
  const title = $('#notification-title').val();
  const message = $('#notification-message').val();
  const sendType = $('#notification-send-type').val();
  const sendTime = $('#notification-time').val();
  const ttl = $('#notification-ttl').val();

  console.log('time', sendTime);

  try {
    const res = await axios.post(
      '/api/1.0/push/scheduled',
      { appID, payload: { title, message }, sendType, sendTime, ttl: ttl },
      { headers: { 'content-type': 'application/json' } }
    );
    console.log(res.data);
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
