versionElement.innerHTML += `&copy; ${new Date().getFullYear()} ${appInfo.name} v${currentAppVersion}`

#app-version > span {
  display: block;
  overflow-x: auto;
}

<footer id="app-version" class="dark-color"><span></span></footer>
