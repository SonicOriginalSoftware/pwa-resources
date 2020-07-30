import { Component } from '../component.js'

export class AppInfo extends Component {
  /** @type {typeof import('/shell/swMessage.js')} */
  #messageServiceWorkerModule
  /** @type {import('/shell/swMessage.js').messageServiceWorker} */
  #messageServiceWorker
  /** @type {ServiceWorker} */
  #activeServiceWorker
  info = { name: '', version: '0.0.0' }

  /**
   * Create a container to hold app information
   * and control events related to app information (current version change, name change, etc.)
   *
   * Preloads the service worker message module
   * @param {ServiceWorkerRegistration} serviceWorkerRegistration
   */
  constructor(serviceWorkerRegistration) {
    super()
    this.#activeServiceWorker = serviceWorkerRegistration.active
    this.#messageServiceWorkerModule = import('/shell/swMessage.js')
  }

  /** Loads the service worker message module */
  async load() {
    this.#messageServiceWorker = (
      await this.#messageServiceWorkerModule
    ).messageServiceWorker
  }

  /**
   * Gets the app information from the service worker
   *
   * Sets the title of the window/document to the name of the app
   *
   * Emits the AppInfoChanged event
   */
  async attach() {
    this.info = await this.#messageServiceWorker(
      'getAppInfo',
      this.#activeServiceWorker
    )
    document.title = this.info.name

    // TODO Emit the app info changed event (details contain the name and version)
    // e.g. The app-version component will care about this event
  }
}
