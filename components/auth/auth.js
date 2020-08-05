import { IndexedDB } from './lib/indexedDB/indexedDb.js'
import { messageServiceWorker } from './shell/swMessage.js'
import { ResponseType } from './lib/auth/oauth/responseType.js'
import { Prompt } from './lib/auth/oauth/prompt.js'
import * as Auth from './lib/auth/auth.js'

const redirectUrl = window.location.origin
// TODO make the response type configurable
const responseType = ResponseType.ACCESS_TOKEN

let signOutBtn

async function lookForUserInStorage() {
  const messageResponse = messageServiceWorker('getDbInfo')
  const dbInfo = await messageResponse
  const idb = new IndexedDB(dbInfo.name, dbInfo.version)

  const getUserResponse = idb.get(Auth.signedInUserId, Auth.authObjectStoreName)
  if (!(await getUserResponse)) {
    console.log('User not found in persistent storage!')
    // TODO Emit userNotInStorage
  } else {
    console.log('User found in persistent storage!')
    // TODO Emit loggedIn
  }
}

function userNotInStorageHandler() {
  if (sessionStorage.redirectNonce !== undefined) {
    const originalNonce = sessionStorage.nonce
    const redirectNonce = sessionStorage.redirectNonce
    const error = sessionStorage.error
    const accessToken = sessionStorage[responseType]
    const providerId = sessionStorage.providerId

    sessionStorage.removeItem('nonce')
    sessionStorage.removeItem('redirectNonce')
    sessionStorage.removeItem('error')
    sessionStorage.removeItem(responseType)
    sessionStorage.removeItem('providerId')

    Auth.validateRedirectResult(
      originalNonce,
      redirectNonce,
      error,
      accessToken,
      providerId,
      redirectUrl,
      apiKey
    )
  } else {
    sessionStorage.nonce = Auth.generateNonce()
    displaySignInOptions()
  }
}

async function displaySignInOptions() {
  document
    .getElementsByTagName('main')[0]
    .insertAdjacentHTML(
      'beforeend',
      await (await fetch('/components/sign-in-form.html')).text()
    )
  Auth.initializeOAuthProviders(clientId)
  document.getElementById(
    'google-sign-in-btn'
  ).href = Auth.providers.google.buildUrl(
    Auth.embedProviderIdInState(
      sessionStorage.nonce,
      Auth.providers.google.providerId
    ),
    responseType,
    Prompt.SELECT_ACCOUNT,
    redirectUrl,
    ['profile', 'email']
  )
}

async function main() {
  if (Auth.redirectResultNeedsStored()) {
    Auth.storeRedirectResultAndReload(redirectUrl)
    return
  }

  const lookForUserResponse = lookForUserInStorage()

  const appTurfResponse = fetch('/components/app-turf.html')

  const pageCSSLink = document.createElement('link')
  pageCSSLink.href = '/styles/appturf.css'
  pageCSSLink.rel = 'stylesheet'
  document.head.appendChild(pageCSSLink)

  document.getElementById('app-turf').innerHTML = await (
    await appTurfResponse
  ).text()

  signOutBtn = document.getElementById('sign-out-btn')
  signOutBtn.addEventListener('click', Auth.logOut)

  AccountView.assignElements()

  await lookForUserResponse
}

document.addEventListener('loggedIn', () => {
  signOutBtn.disabled = false
  AccountView.showLoggedIn()
})
document.addEventListener('loggedOut', () => {
  signOutBtn.disabled = true
  displaySignInOptions()
  AccountView.showLoggedOut()
})
document.addEventListener('userNotInStorage', userNotInStorageHandler)

main()
