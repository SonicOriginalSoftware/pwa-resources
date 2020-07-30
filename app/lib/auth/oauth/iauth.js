/**
 * @abstract
 */
export class IAuth {
  /**
   * @param {String} tokenEndpoint
   * @param {keyof import('../providerId.js').ProviderId} providerId
   * @param {String} clientId
   */
  constructor(tokenEndpoint, providerId, clientId) {
    this.tokenEndpoint = tokenEndpoint
    /** @type {keyof import('../providerId.js').ProviderId} */
    this.providerId = providerId
    this.clientId = clientId

    if (new.target === IAuth)
      throw new TypeError('Cannot instantiate an abstract class')
  }

  /**
   * Generates a redirect URL
   *
   * @param {String} _state an OAuth state parameter
   * @param {keyof import('./responseType.js').ResponseType} _responseType
   * @param {keyof import('./prompt.js').Prompt} _prompt
   * @param {String} _redirectUri
   * @param {String[]} _scopes
   * @param {Boolean} _includeGrantedScopes
   */
  buildUrl(
    _state,
    _responseType,
    _prompt,
    _redirectUri,
    _scopes = [],
    _includeGrantedScopes = true
  ) {}
}
