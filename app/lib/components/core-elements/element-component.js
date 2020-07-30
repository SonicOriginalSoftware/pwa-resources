// NOTE Is there an opportunity to use placeholders in the html components? Or its contents?

// As a convention, this library uses the underscore ('_') character to denote 'protected' class members
// As opposed to the built-in javascript 'private' modifiers ('#')

import { Component } from '../component.js'

/** @typedef {{id: String, tagName: String, componentHtmlPath: String, stylePath: String, classList: String[]}} ComponentElementOptions */

/**
 * Creates a Component-based Element
 *
 * This contains a template element
 * which is used for adding other elements into its shadow
 *
 * During `attach`, it gets attached to the DOM via the argument's `element`
 *
 * @abstract
 */
export class ElementComponent extends Component {
  /** @type {HTMLElement} */
  _element
  /** @type {ShadowRoot} */
  _elementShadow
  /** @type {Promise<Response>} */
  #slotFetch = null
  /** @type {Promise<Response>} */
  _styleSheetFetch = null

  /**
   * Fetches html and css for the element
   *
   * Shadow elements should be attached to the template element here
   *
   * @param {ComponentElementOptions}
   */
  constructor({
    id = '',
    tagName = 'template',
    slotPath = '',
    stylePath = '',
    classList = [],
  } = {}) {
    super()
    if (slotPath !== '') this.#slotFetch = fetch(slotPath)
    if (stylePath !== '') this._styleSheetFetch = fetch(stylePath)

    this._element = document.createElement(tagName)
    this._element.id = id
    this._element.classList = classList
    this._elementShadow = this._element.attachShadow({ mode: 'open' })
  }

  /**
   * Awaits html and styling fetch for the component if there is any
   *
   * Attaches styling to the element through its shadow's adoptedStylesheets
   *
   * Does not attach HTML to the document! (see `attach`)
   */
  async load() {
    if (this.#slotFetch !== null) {
      const htmlResponse = await this.#slotFetch
      // TODO Not sure what to do here yet
      // const html = await htmlResponse.text()
      // const element = document.createElement()
      // element.innerHTML = html.trim()
      // this._templateShadow.appendChild()
    }
    // this._template.content.children
    if (this._styleSheetFetch !== null) {
      const stylesheet = await this._styleSheetFetch
      const style = await stylesheet.text()
      const styleElement = document.createElement('style')
      styleElement.textContent = style
      this._elementShadow.appendChild(styleElement)
    }
  }

  /**
   * @param {HTMLElement} toElement the element on which to attach this element to
   * @param {InsertPosition} insertPosition the position of toElement where this element should be attached
   */
  async attach(toElement, insertPosition) {
    // TODO
  }

  async remove() {
    // NOTE Should this just remove the template content?
    this._element.textContent.remove()
  }
}
