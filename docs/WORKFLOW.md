# App Manager

# Web App Initialization
There is a file in the pwa-template root directory called `init.js`. This is a skeleton file containing a couple functions called by the shell app_manager.

The `load_components` function passes in the global `components` collection (served empty at the point of initialization). The duty of the developer in this function is to populate/`push` the components they wish to use into that collection. See the (API)[] for more information.

The `init.js` file is loaded dynamically so it happens after the Critical Rendering Path fold. This allows the page to present the user with a "Loading" page while the app populates the resources needed to display useful content to the user using a lazy-loading strategy. This optimizes the user-experience and encourages developers to write better apps for their users.
