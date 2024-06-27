const validNonNegativeNumber = new RegExp(/^\d*\.?\d*$/);
const validNonNegativeInteger = new RegExp(/^\d*$/);
const validDate = new RegExp(/^\d{4}-\d{2}-\d{2}/);
const validTime = new RegExp(/^\d{2}:\d{2}/);

const mathJaxNamespace = "xmlns='http://www.w3.org/1998/Math/MathML'";
const mspace = "<mspace width='0.222em'/>";

function $tag(tagName) {
    return document.getElementsByTagName(tagName)[0];
}

function $$tag(tagName) {
    return document.getElementsByTagName(tagName);
}

function $id(elementId) {
    return document.getElementById(elementId);
}

function $$name(name) {
    return document.getElementsByName(name);
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

const debuggerAccessKey = '14446';
let debuggerCurrentKey = '';
function tryDebuggerKey(char) {
    if (debuggerCurrentKey.length < 5) {
        debuggerCurrentKey += char;
    } else {
        debuggerCurrentKey = debuggerCurrentKey.slice(1, 5) + char;
    }
    if (debuggerCurrentKey === debuggerAccessKey) {
        unlockDebugger();
    }
}

function unlockDebugger() {
    if (!$id('debug-container').hidden) {
        return;
    }

    captureDebugRelatedEvents();
    $id('debug-container').hidden = false;
    console.log('%cOn-screen debugger enabled', 'color: #ffff00');
}

let debugEventCount = 0;
const debugEvents = ['', '', ''];
function captureDebugRelatedEvents() {
    const debugRelatedEvents = ['focus', 'focusin', 'focusout', 'blur', 'input', 'change', 'touch'];

    for (const event of debugRelatedEvents) {
        $tag('body').addEventListener(event, event => {
            debugEventCount++;
            debugEvents[2] = debugEvents[1];
            debugEvents[1] = debugEvents[0];
            debugEvents[0] = `
            <span class='accented'>[${debugEventCount}]</span>
            event.type = <span class='warning'>'${event.type}'</span><br>
            tagName = <span class='warning'>'${event.target.tagName}'</span><br>
            id = <span class='warning'>'${event.target.id}'</span><br>
            classList = <span class='warning'>'${event.target.classList}'</span>
            `;

            $id('debug-message').innerHTML = `
            ${debugEvents[0]}<br><br>
            ${debugEvents[1]}<br><br>
            ${debugEvents[2]}
            `;
        });
    }
}

function blurButtonsOnClick() {
    $tag('body').addEventListener('click', event => {

        isButton = event.target.nodeName === 'BUTTON';
        isChildOfButton = event.target.parentNode.nodeName === 'BUTTON';
        if (isButton || isChildOfButton) {
            (isButton ? event.target : event.target.parentNode).blur();
        }
    });
}

function blurSelectizeInstanceOnInputFocusOut() {
    $tag('body').addEventListener('focusout', async event => {

        isSelectizeInput = event.target.id.includes('-selectized');
        if (isSelectizeInput) {
            const selectizeInstance = $id(event.target.id.replace('-selectized', '')).selectize;
            await sleep(500);
            selectizeInstance.blur();
        }
    });
}

function renderMathJax() {
    $(function () { MathJax.typesetPromise(); });
}

const focusedSelectizeInstances = [];
function configureTimeZoneInput(selectId, initialValueSource) {
    $id(selectId).innerHTML = validTimeZonesHtmlString;
    const selectElement = $(`#${selectId}`);

    selectElement.selectize({

        onFocus: function() {
            const focusedInstanceCount = focusedSelectizeInstances.push(this);
            if (focusedInstanceCount > 1) {
                for (const instance of focusedSelectizeInstances) {
                    if (instance !== this) {
                        instance.blur();
                    }
                }
            }

            if (this.getValue() !== '') {
                this.register = this.getValue();
            }

            $id(selectId).selectize.$control_input[0].scrollIntoView(
                {behavior: 'smooth', 'block': 'start'}
            );
        },

        onType: function() {
            convertSpacesToUnderscores(this);
            this.register = this.getTextboxValue();
        },

        onChange: function() {
            this.register = this.getValue();
        },

        onBlur: function() {
            const matchingValue = getCaseInsensitiveOption(this);
            this.setValue(matchingValue);

            if (matchingValue !== '') {
                this.register = matchingValue;
            } else {
                this.setTextboxValue(this.register);
            }
        }
    });

    if (initialValueSource !== undefined) {
        $id(selectId).selectize.setValue(getTimeZoneData(initialValueSource).display);
    }
}

function getCaseInsensitiveOption(selectizeInstance) {
    let match;

    try {
        match = Object.keys(selectizeInstance.options).find(
            key =>
                (key.toLowerCase() === selectizeInstance.register.toLowerCase()) ||
                (key.toLowerCase().split(' ')[0] === 'system' &&
                 selectizeInstance.register.toLowerCase().trim() === 'system') ||
                (key.split('/')[key.split('/').length - 1].toLowerCase() === selectizeInstance.register.toLowerCase())
        );
    } catch (error) {
        if (selectizeInstance.register != undefined) {
            console.error(error.message);
        }
    }

    return match ?? '';
}

function convertSpacesToUnderscores(selectizeInstance) {
    const inputText = selectizeInstance.getTextboxValue();
    if (inputText.slice(0, 6).toLowerCase() !== 'system') {
        const convertedInputText = inputText.replaceAll(' ', '_');
        selectizeInstance.setTextboxValue(convertedInputText);
    } else if (inputText[6] === ' ') {
        const leftPart = inputText.slice(0, 7);
        const rightPart = inputText.slice(7, inputText.length).replaceAll(' ', '_');
        selectizeInstance.setTextboxValue(leftPart + rightPart);
    }
}

const debuggerCharsByTool  = {
    'time-zone-converter': '1',
    'average-hours-calculator': '4',
    'incentives-calculator': '6'
}

let previousToolButton;
let currentTool;
let toolInstanceKey;
async function loadTool(tool, toolButton) {
    setMobileMenuState('closed');

    const debuggerChar = debuggerCharsByTool[tool];
    tryDebuggerKey(debuggerChar ?? '0');

    if (tool === currentTool) {
        return;
    }

    $id('tool-container').hidden = true;
    $id('loading-indicator-container').hidden = false;
    $id('network-error').hidden = true;

    if (previousToolButton != undefined) {
        previousToolButton.classList.remove('selected');
    }

    currentTool = tool;
    toolButton ??= $id('time-zone-converter-tool-button');
    toolButton.classList.add('selected');
    previousToolButton = toolButton;

    let htmlFilename = 'content/';
    switch (tool) {
        case 'time-zone-converter':
            htmlFilename += 'time-zone-converter.html';
            break;
        case 'time-zone-comparison':
            htmlFilename += 'time-zone-comparison.html';
            break;
        case 'dst-info':
            htmlFilename += 'dst-info.html';
            break;
        case 'average-hours-calculator':
            htmlFilename += 'average-hours-calculator.html';
            break;
        case 'median-hours-calculator':
            htmlFilename += 'median-hours-calculator.html';
            break;
        case 'incentives-calculator':
            htmlFilename += 'incentives-calculator.html';
            break;
        case 'settings':
            htmlFilename += 'settings.html';
            break;
        default:
            throw new Error(`No matching tool for \'${tool}\'`);
    }

    let response;
    try {
        response = await fetch(htmlFilename);
    } catch (error) {
        $id('network-error').hidden = false;
        return;
    }

    const text = await response.text();
    $('#tool-container').html($.parseHTML(text));

    toolInstanceKey = Math.random();
    attemptPreparation(tool);

    $id('loading-indicator-container').hidden = true;
    $id('tool-container').hidden = false;
}

function attemptPreparation(tool) {
    switch (tool) {
        case 'time-zone-converter':
            prepareTimeZoneConverter();
            break;
        case 'time-zone-comparison':
            prepareTimeZoneComparison();
            break;
        case 'dst-info':
            prepareDstInfo();
            break;
        case 'average-hours-calculator':
            prepareAverageHoursCalculator();
            break;
        case 'median-hours-calculator':
            prepareMedianHoursCalculator();
            break;
        case 'incentives-calculator':
            prepareIncentivesCalculator();
            break;
        case 'settings':
            prepareSettings();
            break;
        default:
            throw new Error(`No matching case for ${tool}`);
    }
}

function setMobileMenuState(targetState) {

    if (targetState == undefined) {
        const currentState = window
            .getComputedStyle($id('navigation-bar'))
            .getPropertyValue('display');

        const currentlyDisplayed = (currentState !== 'none');
        targetState = (currentState == 'none') ? 'open' : 'closed';
    }

    switch (targetState) {

        case 'closed':
            $id('mobile-menu-button').classList.remove('selected');

            $id('navigation-bar').classList.add('mobile-hidden');
            $id('navigation-bar').classList.remove('mobile-shown');

            $id('theme-toggle').classList.add('mobile-hidden');
            $id('theme-toggle').classList.remove('mobile-shown');

            $id('settings').classList.add('mobile-hidden');
            $id('settings').classList.remove('mobile-shown');
            break;

        case 'open':
            $id('mobile-menu-button').classList.add('selected');

            $id('navigation-bar').classList.add('mobile-shown');
            $id('navigation-bar').classList.remove('mobile-hidden');

            $id('theme-toggle').classList.add('mobile-shown');
            $id('theme-toggle').classList.remove('mobile-hidden');

            $id('settings').classList.add('mobile-shown');
            $id('settings').classList.remove('mobile-hidden');
            break;

        default:
            throw new Error(`Invalid mobile menu state: '${targetState}'`);
    }
}

function setInputTextColor(inputId) {
    if ($id(inputId).value === '') {
        $id(inputId).classList.add('placeholder');
    } else {
        $id(inputId).classList.remove('placeholder');
    }
}

function setMenuSelectionColor(selectMenuId) {
    const input = $id(selectMenuId);
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
        if (element.hidden) {
            button.innerHTML = showText;
        } else {
            button.innerHTML = hideText;
        }
    }
}

function getCheckedRadioButton(radioGroupName) {
    return $selector(`input[name=${radioGroupName}]:checked`);
}

function getCheckedRadioButtonValue(radioGroupName) {
    const checkedRadioButton = getCheckedRadioButton(radioGroupName);
    try {
        return checkedRadioButton.value;
    } catch (error) {
        return undefined;
    }
}

function uncheckRadioButton(radioGroupName) {
    try {
        getCheckedRadioButton(radioGroupName).checked = false;
    } catch (error) {}
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

function distillErrorMessages(errorMessages) {
    errorMessages = errorMessages.filter(error => error != undefined);
    let errorMessage = errorMessages.join('; ');
    errorMessage = (errorMessage.length !== 0) ? errorMessage : undefined;
    return errorMessage;
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
    const results = (Array.isArray(arguments[0]) && arguments.length === 1) ?
        arguments[0] : Array.from(arguments);

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
            errorMessage = `'${inputId}' must be a non-negative number... got '${number}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }
}

function validateRadioGroupChecked(radioGroupNameAndId, errorMessage) {

    if (getCheckedRadioButtonValue(radioGroupNameAndId) == undefined) {
        if (errorMessage == undefined) {
            errorMessage = `'${radioGroupNameAndId}' must have an option selected`;
        }

        applyErrorState(radioGroupNameAndId);
        return errorMessage;

    } else {
        removeErrorState(radioGroupNameAndId);
    }
}

function validateSelectMenuSelected(selectMenuId, errorMessage) {
    if ($id(selectMenuId).value === '--') {
        if (errorMessage == undefined) {
            errorMessage = `'${selectMenuId}' must have an option selected`;
        }

        applyErrorState(selectMenuId);
        return errorMessage;

    } else {
        removeErrorState(selectMenuId);
    }
}

function autofillPreviousQuarter(quarterYearInputId, quarterSelectId) {
    const now = dayjs().utc();
    const quarterYearInput = $id(quarterYearInputId);
    const quarterSelect = $id(quarterSelectId);

    if (now.month() + 1 == 12 || now.month() + 1 <= 2) {
        quarterYearInput.value = now.year() - 1;
        quarterSelect.value = 'Q4';
    } else if (now.month() + 1 >= 9) {
        quarterYearInput.value = now.year();
        quarterSelect.value = 'Q3';

    } else if (now.month() + 1 >= 6) {
        quarterYearInput.value = now.year();
        quarterSelect.value = 'Q2';

    } else if (now.month() + 1 >= 3) {
        quarterYearInput.value = now.year();
        quarterSelect.value = 'Q1';

    } else {
        throw `Unexpected date: ${now.format(format.date)}`;
    }
}

function getNumberRange(start, length, increment = 1) {
    let numbers = [];
    for (const i of Array(length).keys()) {
        numbers.push(start + i * increment);
    }

    return numbers;
}
