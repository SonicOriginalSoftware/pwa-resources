export class AuthenticatedEvent extends CustomEvent {
  /**
   * @param {String} accessToken
   * @param {import('../providerIds.js').ProviderIds}
   */
  constructor(accessToken, providerId) {
    super('authenticated', {
      detail: { accessToken: accessToken, providerId: providerId },
    })
  }
}
