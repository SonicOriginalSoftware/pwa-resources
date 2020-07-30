import { Input } from '../input.js'
import { Label } from '../label.js'

export class CheckBox extends Label {
  /** @type {Input} */
  #checkbox

  /**
   * @param {String} id
   * @param {String} title
   * @param {import('../component-element.js').ComponentElementOptions} elementOptions
   */
  constructor(id, title = '', elementOptions = {}) {
    const labelOptions = elementOptions
    labelOptions.classList = [
      'icon',
      'borderless',
      'clickable',
      ...labelOptions.classList,
    ]
    super(id, `${this.#checkbox._element.id}-label`, title, labelOptions)

    this.#checkbox = new Input(id, { type: 'checkbox' })
    this.#checkbox._element.hidden = true
  }
}

customElements.define('checkbox-component', CheckBox)
