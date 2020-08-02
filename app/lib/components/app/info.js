import { Component } from "../component.js"

export class AppInfo extends Component {
  /** @type {ServiceWorker | null} */
  #activeServiceWorker = null
  info = { name: "", version: "0.0.0" }

  /**
   * @param {String} message
   * @param {ServiceWorker | null} sw
   * @returns {Promise<{name: String, version: String}>}
   */
  #messageServiceWorker = async (
    message,
    sw = navigator.serviceWorker.controller
  ) => {
    if (!sw) {
      console.error("Service worker not ready for messaging")
      return Promise.resolve({ name: "", version: "" })
    }
    const messageChannel = new MessageChannel()
    messageChannel.port1.start() // Required when using eventListener interface

    const messagePromise = new Promise((resolve, reject) => {
      messageChannel.port1.addEventListener("messageerror", (ev) => reject(ev))
      messageChannel.port1.addEventListener("message", (ev) => resolve(ev.data))
    })

    sw.postMessage(message, [messageChannel.port2])

    return messagePromise
  }

  /**
   * Create a container to hold app information
   * and control events related to app information (current version change, name change, etc.)
   *
   * @param {ServiceWorkerRegistration} serviceWorkerRegistration
   */
  constructor(serviceWorkerRegistration) {
    super()
    this.#activeServiceWorker = serviceWorkerRegistration.active
  }

  /** Loads the service worker message module */
  async load() {}

  /**
   * Gets the app information from the service worker
   *
   * Sets the title of the window/document to the name of the app
   *
   * Emits the AppInfoChanged event
   */
  async attach() {
    this.info = await this.#messageServiceWorker(
      "getAppInfo",
      this.#activeServiceWorker
    )
    document.title = this.info.name

    // TODO Emit the app info changed event (details contain the name and version)
    // e.g. The app-version component will care about this event
  }
}
