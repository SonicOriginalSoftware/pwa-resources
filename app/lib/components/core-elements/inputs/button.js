import { Input } from '../input.js'

export class Button extends Input {
  /**
   * @param {String} id
   * @param {String} title hover pop-up text over element
   * @param {import('../element.js').ElementOptions} elementOptions
   */
  constructor(id, title = '', elementOptions = {}) {
    const buttonOptions = elementOptions
    buttonOptions.classList = ['clickable', 'button', buttonOptions.classList]
    super(id, {type: 'button', title: title }, buttonOptions)
  }
}

customElements.define('button-component', Button)
