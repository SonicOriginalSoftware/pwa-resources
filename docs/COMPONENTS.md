# What is a component?
A component is a custom element made to take the boilerplating and monotony of Web Components and make it more straight-forward to jump into. It takes advantage of a number of different technologies including shadow elements, templates, and lazy-loading events.

# Adding components
To add components, run `npx @sonicoriginalsoftware/pwa-framework add-component $component`

With `$component` being the name of the component. Generally this is the folder name but see the Docs for that component.

This will download the component source folder (containing a mixture of HTML files, CSS files, and JS files) and place the folder in your pwa-template `app/components` directory. From there, simply add the component name and path to the component folder to the `components` array that is passed in to the `load_components` function in the `init.js` file. More about that can be read [here](WORKFLOW.md#Component_Initialization)

# Removing components
To remove components, run `npx @sonicoriginalsoftware/pwa-framework remove-component $component`

With `$component` being the name of the component. Again, this is generally the folder name but see the Docs to make sure.

This command will remove the component source by deleting the component source folder.

# Customization
Generally customization is allowed through component styling/`css` but depending on the nature of the component, their behavior may be customized as well. See the documentation on each component for details on what and how to style and what behavior can be customized.

# Loading (Lazily)

# Relationships
Components need to be attached to the DOM at some point. Actual `HTMLElements` end up attached to the DOM shadow-host, but the actual component needs to be attached to the DOM so to allow its shadow root to exist.

Relationships between components are handled through the relationships data structure. This data structure informs the DOM that when certain elements of the DOM become visible, these components should be attached and drawn. The data structure consists of mapping which DOM elements to attach the component to and the HTML DOM relationship in which they are attached (`beforeend`, `afterbegin`, etc.).
