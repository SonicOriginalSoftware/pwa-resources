versionElement.innerHTML += `&copy; ${new Date().getFullYear()} ${app_info.name} v${currentAppVersion}`

#app-version > span {
  display: block;
  overflow-x: auto;
}

<footer id="app-version" class="dark-color"><span></span></footer>
