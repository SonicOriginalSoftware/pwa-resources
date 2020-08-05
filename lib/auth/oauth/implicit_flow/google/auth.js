import { IAuth } from '../../iauth.js'
import { ProviderId } from '../../../providerId.js'

export class GoogleOAuth extends IAuth {
  static tokenEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

  constructor(clientId) {
    super(GoogleOAuth.tokenEndpoint, ProviderId.Google, clientId)
  }

  /** @override */
  buildUrl(
    state,
    responseType,
    prompt,
    redirectUrl,
    scopes = [],
    includeGrantedScopes = true
  ) {
    let url = this.tokenEndpoint
    url += `?response_type=${responseType}`
    url += `&includeGrantedScopes=${includeGrantedScopes}`
    url += `&state=${state}`
    url += `&redirect_uri=${encodeURI(redirectUrl)}`
    url += `&prompt=${prompt}`
    url += `&client_id=${this.clientId}`
    if (scopes !== [])
      url += `&scope=${encodeURI(scopes.toString().replace(',', ' '))}`
    if (this.loginHint !== '') url += `&login_hint=${this.loginHint}`

    return url
  }
}
