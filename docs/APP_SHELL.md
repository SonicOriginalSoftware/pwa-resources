# The App Shell
The app shell consists of two files: `sw.js` and the `app_manager.js`

These two files along with the manifest.json are the core of what allows building progressive web apps without feeling so bloated from boilerplate.

The javascript files reside in the `shell` directory and do not require intervention or editing by the user. Framework developers should instead be modifying the `config.js` file in the pwa-template root. If you find a use case wherein modifying the `sw.js` or `app_manager.js` is necessary please file an issue.

# Service Worker

`sw.js`. The service worker script. This file handles the main service worker events:

- install
- activate
- message
- fetch

# App Manager

`app_manager.js`. This file manages the root app behavior. From the initalization of the app upon install/load, to inter-component communication.
