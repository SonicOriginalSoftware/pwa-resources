async function loadTheme(theme) {
  const theme = document.createElement('link')
  theme.href = `/themes/${theme}.css`
  theme.rel = 'stylesheet'

  // TODO Replace the theme in the head
  // const oldTheme = ''
  // document.head.removeChild(oldTheme)
  document.head.appendChild(theme)
}

let currentTheme = 'default_light'
loadTheme('default_light')
