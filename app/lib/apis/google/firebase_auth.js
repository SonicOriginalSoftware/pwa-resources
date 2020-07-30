/**
 * @param {String} apiKey
 * @param {String} returnUrl
 * @param {String} accessToken
 * @param {keyof import('../../auth/providerId.js').ProviderId} providerId
 */
export async function signIn(apiKey, returnUrl, accessToken, providerId) {
  const payload = {
    postBody: `access_token=${accessToken}&providerId=${providerId}`,
    requestUri: returnUrl,
    returnIdpCredential: false,
    returnSecureToken: false,
  }
  const req = new Request(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    }
  )
  /** @type {Response} */
  let response
  try {
    response = await fetch(req)
  } catch (err) {
    response = err
  }

  return response
}
