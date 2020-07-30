import { Component } from '../component.js'

class Toast extends HTMLElement {
  constructor({ classList = [] } = {}) {
    super()
    this.classList = classList
  }
  // TODO Apply slots (message) by setting a property?
}

class ToastLane extends HTMLElement {
  /** @type {Toast} */
  #toastPrototype

  /** @type {HTMLElement} */
  constructor({ classList = [], toastClassList = [] } = {}) {
    super()
    this.classList = classList

    customElements.define('toast', Toast)
    this.#toastPrototype = document.createElement('toast', {
      classList: toastClassList,
    })
  }

  async showToast(message, timeout) {

  }

  /** @param {string} style */
  set toastStyle(style) {
    this.#toastPrototype.style.cssText = style
  }
}

/** @typedef {{ toastLaneStylePath: String, toastStylePath: String, toastLaneClassList: String[], toastClassList: String[]}} ToastLaneCreationOptions */

export class ToastComponent extends Component {
  /** @type {ToastLane} */
  #toastLane
  /** @type {Promise<Response>} */
  #toastLaneStyleFetch = null
  /** @type {Promise<Response>} */
  #toastStyleFetch = null

  #currentToastId = 0

  /**
   * Creates a ToastLane for showing toasts
   *
   * @param {ToastLaneCreationOptions}
   */
  constructor({
    toastLaneStylePath = '',
    toastStylePath = '',
    toastLaneClassList = [],
    toastClassList = [],
  }) {
    super({
      id: 'toast-lane',
    })
    if (toastLaneStylePath !== '')
      this.#toastLaneStyleFetch = fetch(toastLaneStylePath)
    if (toastStylePath !== '') this.#toastStyleFetch = fetch(toastStylePath)

    customElements.define('toast-lane', ToastLane)
    this.#toastLane = document.createElement('toast-lane', {
      classList: toastLaneClassList,
      toastClassList: toastClassList,
    })
  }

  async load() {
    return Promise.all([
      (this.#toastLane.style = await (await this.#toastLaneStyleFetch).text()),
      (this.#toastLane.toastStyle = await (await this.#toastStyleFetch).text()),
    ])
  }

  /**
   * @param {HTMLElement} toElement the element on which to attach this element to
   * @param {InsertPosition} insertPosition the position of toElement where this element should be attached
   */
  async attach(toElement, position) {
    toElement.insertAdjacentElement(position, this.#toastLane.cloneNode(true))
    // TODO attach the toast-lane to the toElement
  }

  removeToast(id) {
    document.getElementById(`toast${id}`).remove()
  }

  /**
   * @param {String} message
   * @param {Number} number of milliseconds before toast disappears
   *
   * If set to <= 0, will exist until `removeToast` is called with its id
   *
   * @returns the newly created toast's id
   */
  async showToast(message, timeout = 2000) {
    // TODO call attach on the toast element
    // TODO set the timeout callback to the remove of the component
    const id = this.#currentToastId++
    let location = 'afterbegin'
    const toastElement = this.#toastLane._element.insertAdjacentElement(
      location,
      this.#toastPrototype._element.cloneNode(true)
    )
    toastElement.id = `toast${id}`
    toastElement.innerText = message
    if (timeout > 0) {
      location = 'beforeend'
      setTimeout(() => this.removeToast(id), timeout)
    }
    return id
  }
}
