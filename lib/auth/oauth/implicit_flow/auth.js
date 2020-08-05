import { IndexedDB } from '../../../indexedDB/indexedDb.js'
import { GoogleOAuth } from './google/auth.js'
import { messages } from '/shell/messages.js'
import { AppInfo } from '/lib/components/app/info.js'
import * as FirebaseAuth from '../../../apis/google/firebase/firebase_auth.js'

function tokenValidated() {
  // TODO Have firebase validate the token?
  // NOTE Or we could just validate it ourselves...
  return false
}

async function handleTokenChange() {}

async function storeUserInPersistentStorage(userEventData) {
  const userDataPromise = userEventData.detail.json()

  const db_info = await AppInfo.messageServiceWorker(messages.get_db_info)
  // FIXME Should NOT be creating a new IndexedDB here! What!?
  // Open the indexeddb with the db_info.name and version
  // And then store the relevant information in whatever the app maintainers
  // have chosen to call their authentication object store!
  const idb = new IndexedDB(db_info.name, db_info.version)

  const userData = await userDataPromise

  await idb.put(
    signedInUserId,
    {
      displayName: userData.displayName,
      email: userData.email,
      photoUrl: userData.photoUrl,
      accessToken: userData.oauthAccessToken,
      idToken: userData.idToken,
      uid: JSON.parse(userData.rawUserInfo).id
    },
    authObjectStoreName
  )
}

async function removeUserFromPersistentStorage() {
  const dbInfo = await messageServiceWorker('getDbInfo')
  const idb = new IndexedDB(dbInfo.name, dbInfo.version)

  idb.delete(signedInUserId, authObjectStoreName)
}

export function generateNonce() {
  const arr = new Uint8Array(20)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec => ('0' + dec.toString(16)).substr(-2)).join('')
}

/**
 * @param {String} nonce
 * @param {keyof ProviderId} providerId
 */
export function embedProviderIdInState(nonce, providerId) {
  return encodeURI(JSON.stringify({ nonce: nonce, providerId: providerId }))
}

export function redirectResultNeedsStored() {
  return window.location.hash !== ''
}

export function storeRedirectResultAndReload(redirectUrl) {
  for (const eachEntry of window.location.hash.replace('#', '').split('&')) {
    let [key, value] = eachEntry.split('=')
    switch (key) {
      case 'state':
        key = 'redirectNonce'
        const jsonValue = JSON.parse(decodeURI(value))
        sessionStorage.providerId = jsonValue.providerId
        value = jsonValue.nonce
        break

      case 'error':
      case 'access_token':
        break

      default:
        continue
    }
    sessionStorage[key] = value
  }
  window.location.href = redirectUrl
}

/**
 * @param {String} originalNonce
 * @param {String} redirectNonce
 * @param {any} error
 * @param {String} accessToken
 * @param {keyof ProviderId} providerId
 * @param {String} redirectUrl
 * @param {String} apiKey
 */
export function validateRedirectResult(
  originalNonce,
  redirectNonce,
  error,
  accessToken,
  providerId,
  redirectUrl,
  apiKey
) {
  if (originalNonce !== redirectNonce) {
    console.error(
      `Redirect Nonce: ${redirectNonce} - Original Nonce: ${originalNonce}`
    )
    // TODO Emit TokenStateInconsistent
  } else if (error) {
    // TODO Parse the error possibilities
    // Denied, network issue, etc.
    // TODO Emit whatever the error was (Consent denied, etc.)
  } else if (!tokenValidated()) {
    // TODO Emit TokenNotValid
  } else {
    // TODO Emit 'authenticated'
    // Details will include accessToken, providerId, apiKey, and redirectUrl
    // So that they can be used to log in with
  }
}

/**
 * @param {String} apiKey
 * @param {String} redirectUrl
 * @param {String} accessToken
 * @param {keyof ProviderId} providerId
 */
export async function logIn(apiKey, redirectUrl, accessToken, providerId) {
  let fetchErr
  /** @type {Response} */
  let userResponse
  try {
    userResponse = await FirebaseAuth.signIn(
      apiKey,
      redirectUrl,
      accessToken,
      providerId
    )
  } catch (err) {
    console.error(err)
    fetchErr = err
  }

  if (!userResponse.ok || fetchErr) {
    // Emit SignInFail
    return
  }

  storeUserInPersistentStorage(userResponse)

  // Emit 'loggedIn' event
}

export async function logOut() {
  await removeUserFromPersistentStorage()

  // TODO Emit 'loggedOut' event
}

export function initializeOAuthProviders(clientId) {
  providers.google = new GoogleOAuth(clientId)
}

document.addEventListener('tokenRefreshed', handleTokenChange)
document.addEventListener('authenticated', event =>
  logIn(
    event.details.apiKey,
    event.details.redirectUrl,
    event.details.accessToken,
    event.details.providerId
  )
)

export const providers = {
  /** @type {import('./oauth/google/implicit_flow.js').GoogleOAuth} */
  google: undefined,
}

export const signedInUserId = 'user'
export const authObjectStoreName = 'auth'

