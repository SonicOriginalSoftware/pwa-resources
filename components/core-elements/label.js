import { ComponentElement } from './component-element.js'

/** @typedef {{title: String, htmlFor: String}} LabelOptions */

export class Label extends ComponentElement {
  #label

  /**
   * @param {LabelOptions}
   * @param {import('./component-element.js').ComponentElementOptions} componentElementOptions
   */
  constructor({ htmlFor, title = '' } = {}, componentElementOptions = {}) {
    /** @type {import('./component-element.js').ComponentElementOptions} */
    super(componentElementOptions)

    this.#label = document.createElement('label')
    this.#label.htmlFor = htmlFor
    this.#label.title = title
  }


}
