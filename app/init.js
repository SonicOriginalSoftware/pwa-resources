/**
 * Add the initial components that will appear immediately following a page load
 *
 * @param {ServiceWorkerRegistration} serviceWorkerRegistration
 * @param {Map<String, import('./lib/components/component.js').Component>} components
 */
export async function addInitialComponents(
  serviceWorkerRegistration,
  components
) {
  const pathPrefix = '/lib/components'
  const appInfoImport = import(`${pathPrefix}/app/info.js`)
  const toastImport = import(`${pathPrefix}/toast-component/toast-component.js`)

  components.set(
    'app-info',
    new (await appInfoImport).AppInfo(serviceWorkerRegistration)
  )

  components.set(
    'toast-lane',
    new (await toastImport).ToastComponent({
      toastLaneStylePath: '',
      toastStylePath: '',
      toastLaneClassList: [],
      toastClassList: [],
    })
  )

  // TODO import all the other components that are initially required
}

/**
 * @param {Map<String, import('./lib/components/component.js').Component>} components
 */
export async function attachInitialComponents(components) {
  components.get('app-info').attach()

  components.get('toast-lane').attach(document.body, 'afterbegin')
  components.get('toast-lane').showToast('Hey!', 0)

  // Add the changelog component to the body
  // Add the nav-menu component to the body
  // Add the update component to the nav-menu
  // Add the sidebar component to the nav-menu
  // Add the app-turf component to the sidebar
  // Add the account component to the app-turf
  // Add the version component to the sidebar
  // Add the page-buttons to the sidebar
  // Add the settings to the page-buttons
  // Add the theme-chooser component to the settings
  // TODO Theme loading should be handled by the settings theme-chooser
}
