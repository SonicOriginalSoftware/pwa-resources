export class IndexedDB {
  constructor(name, version) {
    /** @type {String} */
    this.name = name

    /** @type {String} */
    this.version = version
  }

  /**
   * @returns {Promise<IDBDatabase>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(this.name, this.version)

      openRequest.addEventListener('error', err => {
        reject(`Database encountered an error: ${err}`)
      })
      openRequest.addEventListener('blocked', () => {
        reject('Database opening is blocked')
      })
      openRequest.addEventListener('upgradeneeded', () => {
        reject('Database cannot be upgraded right now')
      })
      openRequest.addEventListener('success', () => {
        resolve(openRequest.result)
      })
    })
  }

  /**
   * @param {String} objectStoreName
   * @param {IDBTransactionMode} mode
   *
   * @returns {Promise<IDBObjectStore>}
   */
  getObjectStore(objectStoreName, mode) {
    return new Promise(async (resolve, reject) => {
      const connection = await this.connect()
      let transaction
      try {
        transaction = connection.transaction(objectStoreName, mode)
      } catch (exception) {
        reject(exception)
        connection.close()
        return
      }

      let objectStore
      try {
        objectStore = transaction.objectStore(objectStoreName)
      } catch (exception) {
        reject(exception)
        connection.close()
        return
      }
      resolve(objectStore)
    })
  }

  /**
   * @param {any} key
   * @param {String} objectStoreName
   */
  get(key, objectStoreName) {
    return new Promise(async (resolve, reject) => {
      let objectStore
      try {
        objectStore = await this.getObjectStore(objectStoreName, 'readonly')
      } catch (exception) {
        reject(exception)
        return
      }
      const request = objectStore.get(key)
      request.addEventListener('error', error => {
        request.transaction.db.close()
        reject(error)
      })
      request.addEventListener('success', () => {
        request.transaction.db.close()
        resolve(request.result)
      })
    })
  }

  /**
   * @param {any} key
   * @param {any} object
   * @param {String} objectStoreName
   */
  add(key, object, objectStoreName) {
    return new Promise(async (resolve, reject) => {
      let objectStore
      try {
        objectStore = await this.getObjectStore(objectStoreName, 'readwrite')
      } catch (exception) {
        reject(exception)
        return
      }
      let request
      try {
        request = objectStore.add(object, key)
      } catch (exception) {
        request.transaction.db.close()
        reject(exception)
        return
      }
      request.addEventListener('error', error => {
        request.transaction.db.close()
        reject(error)
      })
      request.addEventListener('success', () => {
        request.transaction.db.close()
        resolve(request.result)
      })
    })
  }

  /**
   * @param {any} key
   * @param {any} object
   * @param {String} objectStoreName
   */
  put(key, object, objectStoreName) {
    return new Promise(async (resolve, reject) => {
      let objectStore
      try {
        objectStore = await this.getObjectStore(objectStoreName, 'readonly')
      } catch (exception) {
        reject(exception)
        return
      }
      let request
      try {
        request = objectStore.put(object, key)
      } catch (exception) {
        request.transaction.db.close()
        reject(exception)
        return
      }
      request.addEventListener('error', error => {
        request.transaction.db.close()
        reject(error)
      })
      request.addEventListener('success', () => {
        request.transaction.db.close()
        resolve(request.result)
      })
    })
  }

  /**
   * @param {any} key
   * @param {String} objectStoreName
   */
  delete(key, objectStoreName) {
    return new Promise(async (resolve, reject) => {
      let objectStore
      try {
        objectStore = await this.getObjectStore(objectStoreName, 'readonly')
      } catch (exception) {
        reject(exception)
        return
      }
      const request = objectStore.delete(key)
      request.addEventListener('error', error => {
        request.transaction.db.close()
        reject(error)
      })
      request.addEventListener('success', () => {
        request.transaction.db.close()
        resolve()
      })
    })
  }

  clear(objectStoreName) {
    return new Promise(async (resolve, reject) => {
      /** @type {IDBObjectStore} */
      let objectStore
      try {
        objectStore = await this.getObjectStore(objectStoreName, 'readonly')
      } catch (exception) {
        reject(exception)
        return
      }
      const request = objectStore.clear()
      request.addEventListener('error', error => {
        request.transaction.db.close()
        reject(error)
      })
      request.addEventListener('success', () => {
        request.transaction.db.close()
        resolve()
      })
    })
  }
}
