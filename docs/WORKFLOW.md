# Framework Initialization

The framework is initialized via the [app manager](APP_SHELL.md#App_Manager). By "initialized" it is meant that the user-agent becomes aware of the app service worker (via a service worker registration).

Upon successful service worker registration, there is a check to verify the service is valid. If that is successful, an attempt is made to communicate with the service worker to gain app information (app name and version). That information is used to populate document display information and then [components are registered](WORKFLOW.md#Component_Registration). Once components are registered there is a check for any [pending app updates](WORKFLOW#Progressive_Web_App_Updating) sitting in the background.

# Component Registration

# Component Initialization

There is a file in the pwa-template root directory called `init.js`. This is a skeleton file containing a couple functions called by the shell app_manager.

The `init.js` file is loaded dynamically so it happens after the Critical Rendering Path fold. This allows the page to present the user with a "Loading" page immediately while the app populates the resources needed to display useful content to the user using a lazy-loading strategy. This optimizes the user-experience and encourages developers to write better apps for their users.

The `load_components` function passes in the global `components` collection (served empty at the point of initialization). The duty of the developer in this function is to populate/`push` the components they wish to use into that collection. See the (API)[] for more information.

# Progressive Web App Loading

One of the defining features of this framework is its use of lazy-loading for the components of the app. In other words, an authentication form is not served immediately with the initial app page load. Instead, the component resources wait for whatever container holds the form to be visible to the user before dynamically being loaded in.

This results in a better app initialization time and is therefore more pleasing for the user. It also keeps the memory footprint of the app small. And it is generally just good practice to not shove information into your user's experience if they don't need it, but have it available to them when they would like to use it!

# Progressive Web App Updating

An update to your "app" is signified through a change in the `sw.js` shell file by means of the `config.js` file. This may come as just an increment of the app version string or through explicit changes to data structures in the `config.js` file (like the files to be cached). When an app update is realized by the user-agent the user is prompted with a button and a notification in-app.

# Progressive Web App Update Prompting

The framework provides the means to give the user the option to update when they would like to.

They are given express permission to not click this button until they are ready to do so; page reloads will not "update" the app - they will continue to provide the user with the same app version while also displaying the button to update (successive page reloads with an awaiting app update will not throw a notification up on the screen). The exception to this is reaching the Web App API storage thresholds - but you would never reach this, right? Because you're a responsible web app developer!

When the user does choose to update the new app version is activated and the user's page is refreshed.
