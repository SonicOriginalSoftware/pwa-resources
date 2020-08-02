importScripts("../config.js")

async function remove_obselete_databases() {
  if (navigator.userAgent.match(/firefox/i) !== null) {
    console.error(
      "Sorry, you appear to be using the shitty Firefox browser. " +
        "Until the asshat devs pull their heads out they asses, " +
        "you won't be able to use this app properly."
    )
    return
  }

  console.log(`Removing obsolete databases...`)
  for (const [
    each_database_name,
    each_database_version,
  ] of await indexedDB.databases()) {
    if (each_database_version === db_info.version) continue
    if (each_database_name !== db_info.name) {
      console.log(`Removing ${each_database_name}...`)
      indexedDB.deleteDatabase(each_database_name)
      console.log(`Removed ${each_database_name}!`)
    }
  }
  console.log(`Obsolete databases removed!`)
}

/** Handles shell indexedDB creation */
function install_db() {
  return new Promise((resolve, reject) => {
    const indexedDBOpenRequest = indexedDB.open(db_info.name, db_info.version)

    indexedDBOpenRequest.addEventListener("error", (ev) => {
      console.error(ev)
      reject(ev)
    })

    indexedDBOpenRequest.addEventListener("upgradeneeded", async () => {
      console.log(`${indexedDBOpenRequest.result.name} needs upgraded...`)
      await upgrade_db(indexedDBOpenRequest.result)
    })

    indexedDBOpenRequest.addEventListener("success", (_) => {
      const result_name = indexedDBOpenRequest.result.name
      if (result_name !== db_info.name) {
        reject("Opened the wrong database!")
        return
      }

      const result_version = indexedDBOpenRequest.result.version
      if (result_version !== db_info.version) {
        reject("Opened the wrong database version!")
        return
      }

      console.log(
        `Opened version ${db_info.version} of ${db_info.name}. Closing...`
      )

      indexedDBOpenRequest.result.close()
      resolve()
    })
  })
}

/**
 * Handles database upgrading
 *
 * i.e. object store creation, index creation in each object store, and prior
 * data migration
 *
 * @param {IDBDatabase} db
 */
async function upgrade_db(db) {
  console.log(`Upgrading ${db.name}...`)
  await preDBUpgrade()

  // TODO Could parallelize this...
  for (
    let eachStoreNameIndex = 0;
    eachStoreNameIndex < db.objectStoreNames.length;
    ++eachStoreNameIndex
  ) {
    const objectStoreName = db.objectStoreNames[eachStoreNameIndex]
    console.log(`Deleting object store: ${objectStoreName}...`)
    db.deleteObjectStore(objectStoreName)
    console.log(`${objectStoreName} deleted!`)
  }

  // TODO Could parallelize this...
  for (const [each_store_name, each_store_indices] of object_stores) {
    console.log(`Creating object store: '${each_store_name}'...`)
    const objStore = db.createObjectStore(each_store_name)
    for (const each_index of each_store_indices) {
      console.log(`Creating index: ${each_index.name}`)
      objStore.createIndex(each_index.name, each_index.keyPath)
      console.log(`Created index: ${each_index.name}`)
    }
    console.log(`Created object store: ${each_store_name}`)
  }

  await postDBUpgrade()
  console.log(`${db.name} upgraded!`)
}

async function remove_all_caches() {
  console.log("Removing all caches...")
  await Promise.all(
    (await caches.keys()).map(
      (each_cache_name) =>
        new Promise((resolve) => {
          console.log(`Removing cache: ${each_cache_name}`)
          resolve(caches.delete(each_cache_name))
        })
    )
  )
  console.log("All caches removed!")
}

async function install_caches() {
  console.log("Installing all caches...")
  await Promise.all(
    app_caches.map(
      (each_cache_tuple) =>
        new Promise(async (resolve) => {
          console.log(`Adding cache: ${each_cache_tuple[0]}`)
          resolve(
            await (await caches.open(each_cache_tuple[0])).addAll(
              each_cache_tuple[1]
            )
          )
        })
    )
  )
  console.log("Caches installed!")
}

/**
 * @param {String} path
 * @param {Request} request
 */
async function get_cache_response(path, request) {
  let response
  try {
    for (const eachCacheName of await caches.keys()) {
      const eachCache = await caches.open(eachCacheName)
      response =
        (await eachCache.match(path)) ||
        (await eachCache.match(request, { ignoreSearch: true }))
      if (response) break
    }
  } catch (err) {
    console.error(err)
  }
  return (
    response ||
    Promise.resolve(
      new Response(`Could not find ${path}`, {
        status: 404,
        statusText: "Could not find resource in cache",
      })
    )
  )
}

/** @param {ExtendableEvent} installEvent */
function handle_install(installEvent) {
  console.log("Installing app...")
  installEvent.waitUntil(
    new Promise(async (resolve) => {
      await Promise.all([install_db()])
      console.log("App installed!")
      resolve()
    })
  )
}

/** @param {ExtendableEvent} activateEvent */
function handle_activate(activateEvent) {
  console.log("Activating...")
  activateEvent.waitUntil(
    new Promise(async (resolve) => {
      await Promise.all([remove_obselete_databases(), remove_all_caches()])
      await install_caches()
      self.clients.claim()
      console.log("Activated!")
      resolve()
    })
  )
}

/**
 * Handles incoming messages from the page
 *
 * If the message is 'skipWaiting', immediately places the waiting service worker
 * as the active service worker
 * If the message is 'getVersion', posts the APP_VERSION to the requesting client
 *
 * @param {ExtendableMessageEvent} messageEvent
 */
async function handle_message(messageEvent) {
  switch (messageEvent.data) {
    case "getAppInfo":
      messageEvent.ports[0].postMessage({
        name: app_info.name,
        version: app_info.version,
      })
      break
    case "getDbInfo":
      messageEvent.ports[0].postMessage({
        name: db_info.name,
        version: db_info.version,
      })
      break
    case "getOAuthInfo":
      messageEvent.ports[0].postMessage({
        clientId: oauth_info.clientId,
        apiKey: oauth_info.apiKey,
      })
      break
    case "skipWaiting":
      self.skipWaiting()
      break
  }
}

/**
 * The fetch event handler
 *
 * If the requested path is in the pathWhiteList, attempts to respond with a
 * network fetch of the request first
 *     If that fails, returns the cached lookup
 *
 * Otherwise, a cached lookup occurs
 *
 * If the cached lookup fails, returns a response indicating an error occurred
 *
 * @param {FetchEvent} fetchEvent
 */
function handle_fetch(fetchEvent) {
  const request = fetchEvent.request
  const url = new URL(request.url)
  const path = url.pathname
  const domain = url.origin
  fetchEvent.respondWith(
    new Promise(async (resolve) => {
      if (
        fetchWhiteList.indexOf(path) >= 0 ||
        fetchWhiteList.indexOf(domain) >= 0
      ) {
        let fetchResponse
        try {
          fetchResponse = await fetch(request)
        } catch (err) {
          resolve(get_cache_response(path, request))
          return
        }

        if (
          cacheAfterFetchWhiteList.indexOf(path) >= 0 ||
          cacheAfterFetchWhiteList.indexOf(domain) >= 0
        ) {
          const cacheAfterFetchCache = await caches.open("cache-after-fetch")
          await cacheAfterFetchCache.put(request, fetchResponse.clone())
        }
        resolve(fetchResponse)
      } else {
        resolve(get_cache_response(path, request))
      }
    })
  )
}

/** @type {Array<[String, String[]]>} */
const app_caches = [
  ["cache-after-fetch", []],
  [
    "shell-cache",
    [
      "/",
      "/images/icon-192px.png",
      "/images/icon-512px.png",
      "/lib/semver.js",
      "/shell/appManager.js",
      "/shell/swMessage.js",
      "/themes/default_light.css",
      "/app.css",
      "/config.js",
      "/favicon.ico",
      "/init.js",
      "/manifest.json",
    ],
  ],
  ...CACHED_URLS,
]

const fetchWhiteList = ["/config.js", ...FETCH_WHITELIST]
const cacheAfterFetchWhiteList = CACHE_AFTER_FETCH_WHITELIST

self.addEventListener("install", handle_install)
self.addEventListener("activate", handle_activate)
self.addEventListener("message", handle_message)
self.addEventListener("fetch", handle_fetch)
