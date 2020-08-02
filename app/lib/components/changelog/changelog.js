/** @type {HTMLElement} */
let changelogOverlayElement

/** @type {HTMLElement} */
let showChangelogElement

/** @type {HTMLElement} */
let hideChangelogElement

export async function initialize() {
  changelogOverlayElement = document.getElementById('changelog-overlay')

  showChangelogElement = document.getElementById('show-changelog')
  showChangelogElement.addEventListener('click', showChangelog)
}

// FIXME This method should also be registered as a listener to the
// app_update event being fired
export async function showChangelog(newVersion) {
  const changelogRequest = fetch('../pages/changelog.html')
  const changelogLink = document.createElement('link')
  changelogLink.href = '/shell/styles/changelog.css'
  changelogLink.rel = 'stylesheet'
  document.head.appendChild(changelogLink)

  hideChangelogElement.addEventListener('click', hideChangelog)

  changelogOverlayElement.innerHTML = await (await changelogRequest).text()
  changelogOverlayElement.insertAdjacentElement(
    'afterbegin',
    hideChangelogElement
  )

  for (let eachVersionHeaderElement of changelogOverlayElement.querySelectorAll(
    'section > article > h1'
  )) {
    switch (eachVersionHeaderElement.innerText.replace('V', '')) {
      case currentAppVersion:
        eachVersionHeaderElement.innerHTML += ' (current)'
        break
      case newVersion:
        eachVersionHeaderElement.innerHTML += ' (new)'
        break
    }
  }
  changelogOverlayElement.classList.remove('hidden')
  menuBoxElement.checked = false
}

export function hideChangelog() {
  changelogOverlayElement.classList.add('hidden')
  changelogOverlayElement.innerHTML = ''
}
