<<<<<<< HEAD
// jshint esversion: 6

validateAndLoadTheme();

function getTheme() {
    return localStorage.getItem('theme');
}

function storeTheme(theme, isRepair) {
    const oldTheme = getTheme();
    localStorage.setItem('theme', theme);
    outputStorageUpdate('theme', oldTheme, isRepair);
}

function validateAndLoadTheme() {
    const storedTheme = getTheme();

    if (themeIsValid(storedTheme)) {
        toggleTheme(storedTheme, false);
    } else {
        toggleTheme('dark', true, true);
    }
}

function themeIsValid(theme) {
    return ['light', 'dark'].includes(theme);
}

function toggleTheme(targetTheme, unsaved = true, isRepair = false) {
    if (targetTheme == undefined) {
        const currentTheme = $tag('html').getAttribute('data-theme');
        targetTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    }

    if (!themeIsValid(targetTheme)) {
        console.error(`Invalid theme: '${targetTheme}'`);
        return;
    }

    $class('fa-moon').hidden = (targetTheme === 'dark');
    $class('fa-sun').hidden = (targetTheme === 'light');
    $tag('html').setAttribute('data-theme', targetTheme);

    if (unsaved) {
        storeTheme(targetTheme, isRepair);
    }
}
=======
// jshint esversion: 6

validateAndLoadTheme();

function getTheme() {
    return localStorage.getItem('theme');
}

function storeTheme(theme, isRepair) {
    const oldTheme = getTheme();
    localStorage.setItem('theme', theme);
    outputStorageUpdate('theme', oldTheme, isRepair);
}

function validateAndLoadTheme() {
    const storedTheme = getTheme();

    if (themeIsValid(storedTheme)) {
        toggleTheme(storedTheme, false);
    } else {
        toggleTheme('dark', true, true);
    }
}

function themeIsValid(theme) {
    return ['light', 'dark'].includes(theme);
}

function toggleTheme(targetTheme, unsaved = true, isRepair = false) {
    if (targetTheme == undefined) {
        const currentTheme = $tag('html').getAttribute('data-theme');
        targetTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    }

    if (!themeIsValid(targetTheme)) {
        console.error(`Invalid theme: '${targetTheme}'`);
        return;
    }

    $class('fa-moon').hidden = (targetTheme === 'dark');
    $class('fa-sun').hidden = (targetTheme === 'light');
    $tag('html').setAttribute('data-theme', targetTheme);

    if (unsaved) {
        storeTheme(targetTheme, isRepair);
    }
}
>>>>>>> 4a789041cc4bf8c8831c5515259e265ce84182bc
