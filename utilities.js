// jshint esversion: 8

const validNonNegativeNumber = new RegExp(/^\d*\.?\d*$/);
const validNonNegativeInteger = new RegExp(/^\d*$/);
const validDate = new RegExp(/^\d{4}-\d{2}-\d{2}/);
const validTime = new RegExp(/^\d{2}:\d{2}/);

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

function unfocus(element) {
    element.blur();
}

function unfocusClickedButtons() {
    $tag('body').addEventListener('click', event => {

        isButton = event.target.nodeName === 'BUTTON';
        isChildOfButton = event.target.parentNode.nodeName === 'BUTTON';
        if (isButton || isChildOfButton) {
            unfocus(isButton ? event.target : event.target.parentNode);
        }

    });
}

async function loadTool(tool) {
    $id('tool-container').hidden = true;
    $id('loading-indicator-container').hidden = false;

    let htmlFilename = 'content/';
    switch (tool) {
        case 'time-zone-converter':
            htmlFilename += 'time-zone-converter.html';
            currentTool = 'time-zone-converter';
            break;
        case 'dst-lookup':
            htmlFilename += 'dst-lookup.html';
            currentTool = 'dst-lookup';
            break;
        case 'average-hours-calculator':
            htmlFilename += 'average-hours-calculator.html';
            currentTool = 'average-hours-calculator';
            break;
        case 'median-calculator':
            htmlFilename += 'median-calculator.html';
            currentTool = 'median-calculator';
            break;
        case 'bonus-calculator':
            htmlFilename += 'bonus-calculator.html';
            currentTool = 'bonus-calculator';
            break;
        case 'settings':
            htmlFilename += 'settings.html';
            currentTool = 'settings';
            break;
        default:
            throw new Error(`No matching tool for \'${tool}\'`);
    }

    const response = await fetch(htmlFilename);
    const text = await response.text();
    $('#tool-container').html($.parseHTML(text));
    attemptPreparation(tool);

    $id('loading-indicator-container').hidden = true;
    $id('tool-container').hidden = false;
}

function attemptPreparation(tool) {
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
        case 'median-calculator':
            prepareMedianCalculator();
            break;
        case 'bonus-calculator':
            prepareBonusCalculator();
            break;
        case 'settings':
            prepareSettings();
            break;
        default:
            throw new Error(`No matching case for ${tool}`);
    }
}

function outputStorageUpdate(key, oldValue, isRepair = false) {
    const actionPerformed = isRepair ? 'Repaired' : 'Updated';
    const oldValueColor = isRepair ? '#ff8888' : '#aaaaff';
    let name;
    let getter;

    switch (key) {
        case 'cohort':
            name = 'cohort';
            getter = getDefaultCohort;
            break;
        case 'tier':
            name = 'tier';
            getter = getDefaultTier;
            break;
        case 'theme':
            name = 'theme';
            getter = getTheme;
            break;
        case 'defaultTimeZone':
            name = 'default time zone';
            getter = getDefaultTimeZone;
            break;
        case 'datetimeFormat':
            name = 'datetime format';
            getter = getDatetimeFormat;
            break;
        default:
            throw new Error(`Invalid key: '${key}'`);
    }

    console.log(`${actionPerformed} ${name}: '%c${oldValue}%c' → '%c${getter()}%c'`,
                `color: ${oldValueColor}`, 'color: #', 'color: #88ff88', 'color: #');
}

function setInputSelectionColor(inputId) {
    const input = $id(inputId);
    input.className = input.options[input.selectedIndex].className;
}

function bindKeyPressToButton(elementScopeId, key, buttonId) {
    $id(elementScopeId).addEventListener('keypress', function(event) {
        if (event.key == key) {
            $id(buttonId).click();
        }
    });
}

function bindKeyPressToFocus(elementScopeId, key, elementToFocusId) {
    $id(elementScopeId).addEventListener('keypress', function(event) {
        if (event.key == key) {
            $id(elementToFocusId).focus();
        }
    });
}

function toggleVisibility(elementId, shown, buttonId, showText, hideText) {
    const element = $id(elementId);

    if (shown == undefined) {
        element.hidden = !element.hidden;
    } else {
        element.hidden = !shown;
    }

    if (buttonId != undefined) {
        const button = $id(buttonId);
        if (button.innerHTML === showText) {
            button.innerHTML = hideText;
        } else {
            button.innerHTML = showText;
        }
    }
}

function getCheckedRadioButton(radioGroupName) {
    return $selector(`input[name=${radioGroupName}]:checked`);
}

function uncheckRadioButton(radioGroupName) {
    try {
        getCheckedRadioButton(radioGroupName).checked = false;
    } catch (error) {
        if (!error.message.includes('is null')) {
            throw error;
        }
    }
}

function countInstances(string, substring) {
    return string.split(substring).length - 1;
}

function roundDecimal(number, decimalPlaces) {
    const power = 10 ** decimalPlaces;
    const roundedNumber = Math.round((number + Number.EPSILON) * power) / power;
    return roundedNumber;
}

function removeValueFromArray(array, value) {
    const index = array.indexOf(value);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function applyErrorState(inputId) {
    if ($id(inputId).classList.contains('error')) {
        flashErrorState(inputId);
    } else {
        $id(inputId).classList.add('error');
    }
}

function removeErrorState(inputId) {
    $id(inputId).classList.remove('error');
}

async function flashErrorState(inputId) {
    $id(inputId).classList.remove('error');
    await sleep(170);
    $id(inputId).classList.add('error');
}

function validateSeveral() {
    const results = Array.from(arguments);
    const errors = results.filter(error => error != undefined);
    const errorMessage = errors.join('; ');
    return (errorMessage.length !== 0) ? errorMessage : undefined;
}

function validateNonNegativeNumber(inputId, errorMessage) {
    let number = $id(inputId).value;

    if (number === '') {
        number = $id(inputId).placeholder;
    }

    if (validNonNegativeNumber.test(number)) {
        removeErrorState(inputId);

    } else {

        if (errorMessage == undefined) {
            errorMessage = `Input must be a non-negative number... got '${number}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }
}

function validateRadioGroupChecked(radioGroupNameAndId, errorMessage) {

    try {
        const selectedValue = getCheckedRadioButton(radioGroupNameAndId).value;
        removeErrorState(radioGroupNameAndId);
    } catch (error) {
        if (!error.message.includes('is null')) {
            throw error;
        }

        if (errorMessage == undefined) {
            errorMessage = `'${radioGroupNameAndId}' must have an option selected`;
        }

        applyErrorState(radioGroupNameAndId);
        return errorMessage;
    }
}
