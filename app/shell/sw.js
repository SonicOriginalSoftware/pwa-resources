importScripts('../config.js')

async function removeObsoleteDatabases() {
  console.log(`Removing obsolete databases...`)
  for (const eachDatabase of await indexedDB.databases()) {
    if (eachDatabase.name !== dbInfo.name) {
      console.log(`Removing ${eachDatabase.name}...`)
      indexedDB.deleteDatabase(eachDatabase.name)
      console.log(`Removed ${eachDatabase.name}!`)
    }
  }
  console.log(`Obsolete databases removed!`)
}

/** Handles shell indexedDB creation */
function installDB() {
  console.log(`Opening version ${dbInfo.version} of ${dbInfo.name}...`)

  return new Promise((resolve, reject) => {
    const indexedDBOpenRequest = indexedDB.open(dbInfo.name, dbInfo.version)

    indexedDBOpenRequest.addEventListener('error', ev => {
      console.error(ev)
      reject(ev)
    })

    indexedDBOpenRequest.addEventListener('success', () => {
      const resultName = indexedDBOpenRequest.result.name
      const resultVersion = indexedDBOpenRequest.result.version
      if (resultName !== dbInfo.name) {
        reject('Opened the wrong database!')
        return
      }
      if (resultVersion !== dbInfo.version) {
        reject('Opened the wrong database version!')
        return
      }

      console.log(
        `Opened version ${dbInfo.version} of ${dbInfo.name}. Closing...`
      )
      indexedDBOpenRequest.result.close()
      console.log(`Closed ${indexedDBOpenRequest.result.name}`)
      resolve()
    })

    indexedDBOpenRequest.addEventListener('upgradeneeded', async () => {
      console.log(`${indexedDBOpenRequest.result.name} needs upgraded...`)
      await upgradeDB(indexedDBOpenRequest.result)
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
async function upgradeDB(db) {
  console.log(`Upgrading ${db.name}...`)
  await preDBUpgrade()

  // TODO Could parallelize this...
  for (
    const eachStoreNameIndex = 0;
    eachStoreNameIndex < db.objectStoreNames.length;
    ++eachStoreNameIndex
  ) {
    const objectStoreName = db.objectStoreNames[eachStoreNameIndex]
    console.log(`Deleting object store: ${objectStoreName}...`)
    db.deleteObjectStore(objectStoreName)
    console.log(`${objectStoreName} deleted!`)
  }

  // TODO Could parallelize this...
  for (const eachObjectStoreName in objectStores) {
    console.log(`Creating object store: '${eachObjectStoreName}'...`)
    const objStore = db.createObjectStore(eachObjectStoreName)
    for (const eachIndex of objectStores[eachObjectStoreName]) {
      console.log(`Creating index: '${eachIndex.name}'...`)
      objStore.createIndex(eachIndex.name, eachIndex.keyPath)
      console.log(`Index: '${eachIndex.name}' created!`)
    }
    console.log(`'${eachObjectStoreName}' created!`)
  }

  await postDBUpgrade()
  console.log(`${db.name} upgraded!`)
}

async function removeAllCaches() {
  console.log('Removing all caches...')
  /** @type {Promise<boolean>[]} */
  const deleteCachePromises = []
  for (const eachCacheKey of await caches.keys()) {
    deleteCachePromises.push(
      new Promise(resolve => resolve(caches.delete(eachCacheKey)))
    )
  }
  await Promise.all(deleteCachePromises)
  console.log('All caches removed!')
}

async function installCaches() {
  console.log('Installing caches...')
  let addAppCachesPromise = []
  for (const eachCacheKey in appCaches) {
    console.log(`Installing ${eachCacheKey}...`)
    addAppCachesPromise.push(
      new Promise(async resolve =>
        resolve(
          await (await caches.open(eachCacheKey)).addAll(
            appCaches[eachCacheKey]
          )
        )
      )
    )
  }
  await Promise.all(addAppCachesPromise)
  console.log('Caches installed!')
}

async function getCacheResponse(path, request) {
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
        statusText: 'Could not find resource in cache',
      })
    )
  )
}

function installCallback(installEvent) {
  console.log('Installing...')
  installEvent.waitUntil(
    new Promise(async resolve => {
      await Promise.all([installDB()])
      console.log('Installed!')
      resolve()
    })
  )
}

function activateCallback(activateEvent) {
  console.log('Activating...')
  activateEvent.waitUntil(
    new Promise(async resolve => {
      await Promise.all([removeObsoleteDatabases(), removeAllCaches()])
      await installCaches()
      self.clients.claim()
      console.log('Activated!')
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
async function messageCallback(messageEvent) {
  switch (messageEvent.data) {
    case 'getAppInfo':
      messageEvent.ports[0].postMessage({
        name: appInfo.name,
        version: appInfo.version,
      })
      break
    case 'getDbInfo':
      messageEvent.ports[0].postMessage({
        name: dbInfo.name,
        version: dbInfo.version,
      })
      break
    case 'getOAuthInfo':
      messageEvent.ports[0].postMessage({
        clientId: oauthInfo.clientId,
        apiKey: oauthInfo.apiKey,
      })
      break
    case 'skipWaiting':
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
function fetchCallback(fetchEvent) {
  const request = fetchEvent.request
  const url = new URL(request.url)
  const path = url.pathname
  const domain = url.origin
  fetchEvent.respondWith(
    new Promise(async resolve => {
      if (
        fetchWhiteList.indexOf(path) >= 0 ||
        fetchWhiteList.indexOf(domain) >= 0
      ) {
        let fetchResponse
        try {
          fetchResponse = await fetch(request)
        } catch (err) {
          resolve(getCacheResponse(path, request))
          return
        }

        if (
          cacheAfterFetchWhiteList.indexOf(path) >= 0 ||
          cacheAfterFetchWhiteList.indexOf(domain) >= 0
        ) {
          const cacheAfterFetchCache = await caches.open('cache-after-fetch')
          await cacheAfterFetchCache.put(request, fetchResponse.clone())
        }
        resolve(fetchResponse)
      } else {
        resolve(getCacheResponse(path, request))
      }
    })
  )
}

/** @type {Map<String, String[]>} */
const appCaches = {
  'cache-after-fetch': [],
  'shell-cache': [
    '/',
    '/images/icon-192px.png',
    '/images/icon-512px.png',
    '/lib/semver.js',
    '/shell/appManager.js',
    '/shell/swMessage.js',
    '/themes/default_light.css',
    '/app.css',
    '/config.js',
    '/favicon.ico',
    '/init.js',
    '/manifest.json',
  ],
  ...CACHED_URLS,
}

const fetchWhiteList = [ '/config.js', ...FETCH_WHITELIST ]
const cacheAfterFetchWhiteList = CACHE_AFTER_FETCH_WHITELIST

self.addEventListener('install', installCallback)
self.addEventListener('activate', activateCallback)
self.addEventListener('message', messageCallback)
self.addEventListener('fetch', fetchCallback)
