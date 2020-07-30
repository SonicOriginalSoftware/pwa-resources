const appStatusElement = document.getElementById('app-status')

/** @type {Map<String, import('../lib/components/component.js').Component>} */
let components = new Map()
/** @type {ServiceWorkerRegistration} */
let serviceWorkerRegistration

async function loadInitialComponents() {
  const loadComponentsPromises = []
  for (const [id, component] of components) {
    loadComponentsPromises.push(
      new Promise(async (resolve, reject) => {
        appStatusElement?.insertAdjacentHTML(
          'beforeend',
          `<span style='display: block;' id='load-${id}'>Loading ${id}...</span>`
        )
        console.log(`Loading ${id}...`)
        try {
          await component.load()
        } catch (reason) {
          reject({ reason: reason, component: id })
          return
        }
        console.log(`${id} loaded!`)
        document.getElementById(`load-${id}`).innerHTML = `Loaded ${id}!`
        resolve()
      })
    )
  }
  return Promise.all(loadComponentsPromises)
}

/**
 * This function is run after service worker registration has completed
 * with an active service worker
 *
 * This imports the consumer init module, adds initial components, loads them, and attaches them
 *
 * Note that there may be a service worker waiting as well
 */
export async function registerComponents() {
  if (!serviceWorkerRegistration || !serviceWorkerRegistration.active) {
    if (serviceWorkerRegistration && serviceWorkerRegistration.installing)
      handleAppManagerError(
        'No service worker registered!',
        'The app was not registered correctly.'
      )
    return
  }

  let initModule
  try {
    initModule = await import('../init.js')
  } catch (reason) {
    handleAppManagerError(reason.message, "Couldn't import init module")
    return
  }

  try {
    await initModule.addInitialComponents(serviceWorkerRegistration, components)
  } catch (reason) {
    handleAppManagerError(
      reason.message,
      `Failed adding ${reason.component} component`
    )
    return
  }

  try {
    await loadInitialComponents()
  } catch (reason) {
    handleAppManagerError(
      reason.message,
      `Failed loading ${reason.component} component`
    )
    return
  }

  try {
    await initModule.attachInitialComponents(components)
  } catch (reason) {
    handleAppManagerError(
      reason.message,
      `Failed attaching ${reason.component} component`
    )
    return
  }

  // This should be handled by the Theme component
  // As in, NOT using Constructable stylesheets. Because they SUCK too.
  // const defaultLightTheme = new CSSStyleSheet()
  // const themeFetch = defaultLightTheme.replace(
  //   `@import '/themes/default_light.css'`
  // )

  // const theme = await themeFetch
  // document.adoptedStyleSheets = [...document.adoptedStyleSheets, theme]

  appStatusElement?.remove()
}

/**
 * @param {any} err Error to display to `console.error`
 * @param {String} reasonText Reason to display to the user
 */
function handleAppManagerError(err, reasonText) {
  appStatusElement.innerHTML = reasonText || 'Web app failed to load'
  console.error(err)
}

window.addEventListener('load', registerComponents)

navigator.serviceWorker.addEventListener('controllerchange', () => {
  sessionStorage.clear()
  window.location.reload()
})

navigator.serviceWorker
  .register('sw.js', {
    scope: '/',
    updateViaCache: 'none',
    // type: 'module',
  })
  .then((reg) => (serviceWorkerRegistration = reg))
  .catch(handleAppManagerError)
