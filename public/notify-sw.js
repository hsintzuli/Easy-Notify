// From service-worker.js:
const channel = new BroadcastChannel('Notify-sw');

// Register event listener for the 'push' event.
self.addEventListener('push', async function (event) {
  // Retrieve the textual payload from event.data (a PushMessageData object).
  // Other formats are supported (ArrayBuffer, Blob, JSON), check out the documentation
  // on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.
  const data = event.data ? event.data.json() : 'no payload';
  console.log(data);
  channel.postMessage(data);
  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
    })
  );
});
