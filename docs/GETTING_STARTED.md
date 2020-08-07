# Getting Started

Use this page to get a diving-in point on how to build a web app with this framework.

# Installing

The user-centric side of the framework is oriented towards the CLI toolkit. To initialize a web app using this framework, create a directory to house the web app, `cd` into it, and run:

`npx @sonicoriginalsoftware/pwa-framework init`

This creates a web-app with these defaults:

- the default pwa-template root
- an HTTP/2 server capable of running locally that can serve your web app (just run `npm start`)
- an initial package.json ready for you to modify with your app name (with the devDependency for this framework already included) and other app properties (repository, keywords, etc.)

# Loading

### Okay. Then what? There's nothing on my page. Just a shell of a progressive web app!

Exactly! It is essential that no assumptions but the absolute necessary ones are made about the app you want to build. The framework makes it trivial though to start the addition of components and their customization for the needs of your app.

# Components

### What the heck are components?

See the [Components](COMPONENTS.md) document.

# Customization

### Cool. So how do I customize it?

Get information about component customization [here](COMPONENTS.md#Customization).

# Workflow

### What does the workflow look like? How is the app loaded on the page?

See the [Workflow](WORKFLOW.md) document.
