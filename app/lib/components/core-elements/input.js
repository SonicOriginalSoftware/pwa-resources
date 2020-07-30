import { ComponentElement } from './component-element.js'

/** @typedef {type: String, title: String}} InputOptions */

export class Input extends ComponentElement {
  /**
   * @param {InputOptions}
   * @param {import('./component-element.js').ComponentElementOptions} elementOptions
   */
  constructor({ type = 'button', title = '' } = {}, elementOptions = {}) {
    const inputOptions = elementOptions
    inputOptions.tagName = 'input'
    super(inputOptions)
    this._element.type = type
    this._element.title = title
  }
}
