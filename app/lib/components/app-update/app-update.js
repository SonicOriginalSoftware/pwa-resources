import { Component } from '../component.js'

import { message, messages } from '/lib/service-worker/service_worker.js'

// FIXME Below is the html of the element
{/* <input
  type="button"
  id="get-update"
  title="Get Update"
  class="icon clickable bold-color hidden"
/> */}

// FIXME Below is the styling for the element
// #get-update {
//   padding: 6px;
//   background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px"><path d="M0 .5h24v24H0z" fill="none"/><path d="M12 16.5l4-4h-3v-9h-2v9H8l4 4zm9-13h-6v1.99h6v14.03H3V5.49h6V3.5H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z"/></svg>');
// }

export class Update extends Component {
  /**
   * This should be registered as the callback/listener
   * for when the app_update event is fired
   */
  async show_update_button() {
    update_button.classList.remove('hidden')
  }

  update_button.addEventListener('click', () => {
    message(messages.update, waiting_service_worker)
  })
}
