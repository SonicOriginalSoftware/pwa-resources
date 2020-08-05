# Getting Started
Use this page to get a diving-in point on how to build a web app with this framework.

# Installing
The user-centric side of the framework is oriented towards the CLI toolkit. To initialize a web app using this framework, run:

`npx @sonicoriginalsoftware/pwa-framework init`

This creates a web-app with these defaults:

- the default pwa-template root
- an HTTP/2 server capable of running locally that can serve your web app
- an initial package.json ready for you to modify with your app name (with the devDependency for this framework already included)

# Loading
## Okay. Then what? There's nothing on my page. Just a shell of a progressive web app!

Exactly! We don't throw in anything by default but making the addition of components and their customization for your needs a trivial matter.

To get started adding components, you can run `npx @sonicoriginalsoftware/pwa-framework add-component $component`

This will download the component source and place the files in your pwa-template `components` directory. From there, simply add the component name and path to the component folder to the `components` array that is passed in to the `load_components` function in the `init.js` file. More about that can be read [here](docs/WORKFLOW.md#Web_App_Initialization)

# Customization
## Cool. So how do I customize it?
Most components offer some degree of customization. Largely this is by means of allowing custom `css` for their components but occassionally there are opportunities to customize behavior, depending on the nature of the component. See the documentation on the desired component to get more details.
