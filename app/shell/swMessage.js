/**
 * @param {String} message
 * @param {ServiceWorker} sw
 * @returns {Promise<{name: String, version: String}>}
 */
export async function messageServiceWorker(
  message,
  sw = navigator.serviceWorker.controller
) {
  if (!sw) {
    console.error('Service worker not ready for messaging')
    return Promise.resolve({})
  }
  const messageChannel = new MessageChannel()
  messageChannel.port1.start() // Required when using eventListener interface

  const messagePromise = new Promise((resolve, reject) => {
    messageChannel.port1.addEventListener('messageerror', ev => reject(ev))
    messageChannel.port1.addEventListener('message', ev => resolve(ev.data))
  })

  sw.postMessage(message, [messageChannel.port2])

  return messagePromise
}
