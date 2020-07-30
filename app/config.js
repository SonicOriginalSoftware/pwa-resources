const appInfo = Object.freeze({
  name: 'App Name Here',
  version: '0.1.0',
})

const dbInfo = Object.freeze({
  name: 'app-db',
  version: 1,
})

const oauthInfo = Object.freeze({
  clientId: {},
  apiKey: {},
})

const objectStores = Object.freeze({
  auth: [],
})

const CACHED_URLS = Object.freeze({
  'app-components': [],
  'framework-components': ['/lib/components/app/info.js'],
  component: ['/lib/components/component.js', '/lib/components/style.css'],
  images: [],
  'core-elements': [
    '/lib/components/core-elements/inputs/button.js',
    '/lib/components/core-elements/inputs/checkbox.js',
    '/lib/components/core-elements/element-component.js',
    '/lib/components/core-elements/input.js',
    '/lib/components/core-elements/label.js',
  ],
  indexedDB: [],
  apis: [],
})

const FETCH_WHITELIST = []

const CACHE_AFTER_FETCH_WHITELIST = []

async function preDBUpgrade() {
  // If there's ever any data migration to do, need to collect necessary data
  // at this point from current object stores
}

async function postDBUpgrade() {
  // After any DB creation and object store creation is done, perform any
  // necessary migration
}
