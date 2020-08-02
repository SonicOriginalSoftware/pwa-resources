const app_info = Object.freeze({
  name: "App Name Here",
  version: "0.1.0",
})

const db_info = Object.freeze({
  name: "app-db",
  version: 1,
})

const oauth_info = Object.freeze({
  clientId: {},
  apiKey: {},
})

/** @type {Array<[String, {'name': String, 'keyPath': String}[]]>} */
const object_stores = []

/** @type {Array<[String, String[]]>} */
const CACHED_URLS = [
  ["app-components", []],
  ["framework-components", []],
  ["component", ["/lib/components/component.js", "/lib/components/style.css"]],
  ["images", []],
  [
    "icons",
    ["/icons/icon-192px.png", "/icons/icon-512px.png", "/favicon.ico"],
  ],
  [
    "core-elements",
    [
      "/lib/components/core-elements/inputs/button.js",
      "/lib/components/core-elements/inputs/checkbox.js",
      "/lib/components/core-elements/element-component.js",
      "/lib/components/core-elements/input.js",
      "/lib/components/core-elements/label.js",
    ],
  ],
  ["themes", ["/themes/default_light.css"]],
  ["indexedDB", []],
  ["apis", []],
]

/** @type {String[]} */
const FETCH_NETWORK_FIRST_LIST = []

/** @type {String[]} */
const CACHE_AFTER_FETCH_INCLUDE_LIST = []

async function pre_db_upgrade() {
  // If there's ever any data migration to do, need to collect necessary data
  // at this point from current object stores
}

async function post_db_upgrade() {
  // After any DB creation and object store creation is done, perform any
  // necessary migration
}
