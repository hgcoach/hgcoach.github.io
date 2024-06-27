function displayTheme(theme) {
    $id('dark-mode-button').hidden = (theme === 'dark');
    $id('light-mode-button').hidden = (theme === 'light');
    $tag('html').setAttribute('data-theme', theme);
}
