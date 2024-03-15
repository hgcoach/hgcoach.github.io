// jshint esversion: 10

const validNonNegativeNumber = new RegExp(/^\d*\.?\d*$/);
const validNonNegativeInteger = new RegExp(/^\d*$/);

let dateFormat = 'YYYY-MM-DD';
let datetimeFormat = 'HH:mm on YYYY-MM-DD';

loadTool('time-zone-converter');

function $tag(tagName) {
    return document.getElementsByTagName(tagName)[0];
}

function $$tag(tagName) {
    return document.getElementsByTagName(tagName);
}

function $id(elementId) {
    return document.getElementById(elementId);
}

function $class(className) {
    return document.getElementsByClassName(className)[0];
}

function $$class(className) {
    return document.getElementsByClassName(className);
}

function $selector(selector) {
    return document.querySelector(selector);
}

function $$selector(selector) {
    return document.querySelectorAll(selector);
}

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function toggleTheme(button) {
    const html = $tag('html');
    const sun = $class('fa-sun');
    const moon = $class('fa-moon');
    const theme = html.getAttribute('data-theme');

    if (theme === 'dark') {
        sun.hidden = true;
        moon.hidden = false;
        html.setAttribute('data-theme', 'light');
    } else {
        moon.hidden = true;
        sun.hidden = false;
        html.setAttribute('data-theme', 'dark');
    }

    button.blur();
}

async function loadTool(tool, button) {
    if (button != undefined) {
        button.blur();
    }

    let htmlFilename = 'content/';
    switch (tool) {
        case 'time-zone-converter':
            htmlFilename += 'time-zone-converter.html';
            break;
        case 'dst-lookup':
            htmlFilename += 'dst-lookup.html';
            break;
        case 'average-hours-calculator':
            htmlFilename += 'average-hours-calculator.html';
            break;
        case 'bonus-calculator':
            htmlFilename += 'bonus-calculator.html';
            break;
        default:
            throw new Error(`No matching tool for ${tool}`);
    }

    console.log(`Fetching ${htmlFilename}...`);
    const response = await fetch(htmlFilename);

    const text = await response.text();

    $('#tool-container').html($.parseHTML(text));

    attemptPreparation(tool);

    // console.log('Waiting for DOM to render...');

    // let domIsRendered = false;
    // const interval = 50;
    // const cutoff = 3000;
    // const start = Date.now();
    // let delta = 0;

    // while (!domIsRendered) {
    //     if (delta < cutoff) {
    //         domIsRendered = attemptPreparation(tool);
    //     } else {
    //         throw new Error(`Timed out while trying to prepare ${tool}`);
    //     }
    //     if (domIsRendered) {
    //         break;
    //     }
    //     console.log(`%c${delta} ms elapsed. Trying again in ~${interval} ms...`, 'color: #777777');
    //     delta = Date.now() - start;
    //     await sleep(interval);
    // }
}

function attemptPreparation(tool, interval) {
    try {
        switch (tool) {
            case 'time-zone-converter':
                prepareTimeZoneConverter();
                break;
            case 'dst-lookup':
                prepareDstLookup();
                break;
            case 'average-hours-calculator':
                prepareAverageHoursCalculator();
                break;
            case 'bonus-calculator':
                prepareBonusCalculator();
                break;
            default:
                throw new Error(`No matching case for ${tool}`);
        }
        return true;

    } catch (error) {
        if (error.message.includes('is not defined')) {
            console.log('%c' + error.message, 'color: #ff0000');
            return false;
        } else {
            throw error;
        }
    }
}

function bindKeyPressToButton(elementScope, key, button) {
    elementScope.addEventListener('keypress', function(event) {
        if (event.key == key) {
            button.click();
        }
    });
}

function bindKeyPressToFocus(elementScope, key, elementToFocus) {
    elementScope.addEventListener('keypress', function(event) {
        if (event.key == key) {
            elementToFocus.focus();
        }
    });
}
