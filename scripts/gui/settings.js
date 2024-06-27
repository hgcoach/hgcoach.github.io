const componentSelectMenuIds = {
    'dateOrder': 'date-order-setting',
    'dayOfTheWeek': 'day-of-the-week-setting',
    'year': 'year-format-setting',
    'month': 'month-format-setting',
    'day': 'day-format-setting',
    'separator': 'date-separator-setting',
    'comma': 'comma-setting',
    'the': 'the-setting',
    'of': 'of-setting',
    'at': 'at-setting',
    'clock': 'clock-format-setting',
    'hourDigits': 'hour-format-setting',
    'amPm': 'am-pm-format-setting'
}

let datetimeFormatPreviewComponents;
let datetimeFormatPreview;

let saveIndicatorCalls;

function prepareSettings() {
    if (!storage.webStorageMode) {
        $id('settings-enabled').hidden = true;
        $id('settings-disabled').hidden = false;
        console.log('%cFailed to prepare \'settings\'', 'color: #ff8888');
        return;
    }

    $id('unsaved-warning').hidden = true;
    saveIndicatorCalls = 0;
    $id('save-indicator').hidden = true;

    mapCohortSelection();
    setMenuSelectionColor('cohort');
    mapTierSelection();
    setMenuSelectionColor('tier');
    setUpCohortAndTierSelectionBehavior();

    configureTimeZoneInput('default-time-zone', 'default');

    mapDatetimeFormatSelections();
    syncDatetimePreviewWithInputs();

    $(function() {
        updateDatetimeFormatPreview(format.datetime, false);
    });

    console.log('%cPrepared \'settings\'', 'color: #88ff88');
}

function applySettings() {
    const errorMessage = validateTimeZone('default-time-zone');
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const cohortSelection = $id('cohort').value;
    switch (cohortSelection) {
        case '--':
            storage.revert('cohort');
            break;
        case '0-5':
        case '6+':
            storage.set('cohort', cohortSelection);
            break;
        default:
            throw new Error(`Invalid cohort: '${cohortSelection}'`);
    }

    const tierSelection = $id('tier').value;
    switch (tierSelection) {
        case '--':
            storage.revert('tier');
            break;
        case 'core':
        case 'advanced':
        case 'master':
            storage.set('tier', tierSelection);
            break;
        default:
            throw new Error(`Invalid tier: '${tierSelection}'`);
    }

    const timeZoneData = getTimeZoneData('default-time-zone');
    const oldTimeZone = storage.get('timeZone');

    if ((timeZoneData.isSystemTime && oldTimeZone !== 'System') ||
        (!timeZoneData.isSystemTime && timeZoneData.identifier !== oldTimeZone)) {
        storage.set('timeZone',
            timeZoneData.isSystemTime ? 'System' : timeZoneData.identifier);
    }

    if (datetimeFormatPreview !== format.datetime) {
        storage.set('datetimeFormatComponents', datetimeFormatPreviewComponents);
    }

    $id('unsaved-warning').hidden = true;
    temporarilyDisplaySaveIndicator();
}

function revertToDefaultSettings() {
    storage.revertAll();
    $id('cohort').value = '--';
    $id('tier').value = '--';
    setMenuSelectionColor('cohort');
    setMenuSelectionColor('tier');
    $id('default-time-zone').selectize.setValue(getTimeZoneData('default').display);
    validateTimeZone('default-time-zone');
    mapDatetimeFormatSelections();
    updateDatetimeFormatPreview(format.datetime, false);
    $id('unsaved-warning').hidden = true;
    temporarilyDisplaySaveIndicator();
}

function toggleDateFormatSettingsVisibility() {
    toggleVisibility('date-format-settings',
                     undefined,
                     'date-format-settings-button',
                     'Date format settings',
                     'Hide date format settings');
}

function toggleTimeFormatSettingsVisibility() {
    toggleVisibility('time-format-settings',
                     undefined,
                     'time-format-settings-button',
                     'Time format settings',
                     'Hide time format settings');
}

async function temporarilyDisplaySaveIndicator() {
    saveIndicatorCalls++;
    const callKey = toolInstanceKey;

    $id('save-indicator').hidden = false;
    await sleep(3000);

    if (callKey !== toolInstanceKey) {
        return;
    }

    if (saveIndicatorCalls !== 1) {
        saveIndicatorCalls--;
        return;
    }

    try {
        $id('save-indicator').hidden = true;
        saveIndicatorCalls--;
    } catch (error) {
        if (currentTool === 'settings') {
            throw error;
        }
    }
}

function mapCohortSelection() {
    const storedCohort = storage.get('cohort');
    if (storedCohort == undefined) {
        $id('cohort').value = '--';
    } else if (['0-5', '6+'].includes(storedCohort)) {
        $id('cohort').value = storedCohort;
    } else {
        throw new Error(`Invalid cohort: '${storedCohort}'`);
    }
}

function mapTierSelection() {
    const storedTier = storage.get('tier');
    if (storedTier == undefined) {
        $id('tier').value = '--';
    } else if (['core', 'advanced', 'master'].includes(storedTier)) {
        $id('tier').value = storedTier;
    } else {
        throw new Error(`Invalid tier: '${storedTier}'`);
    }
}

function mapDatetimeFormatSelections() {
    const components = storage.get('datetimeFormatComponents');

    for (const [component, selectMenuId] of Object.entries(componentSelectMenuIds)) {
        $id(selectMenuId).value = components[component];
    }
}

function setUpCohortAndTierSelectionBehavior() {
    for (selectMenuId of ['cohort', 'tier']) {
        $id(selectMenuId).setAttribute('onchange', `
            setMenuSelectionColor('${selectMenuId}');
            $id("save-indicator").hidden = true;
            $id("unsaved-warning").hidden = false;`);
    }
}

function syncDatetimePreviewWithInputs() {
    const commandString = 'updateDatetimeFormatPreview()';

    $id('default-time-zone').setAttribute('onchange', commandString);

    const dateFormatSelectMenus = $id('date-format-settings').getElementsByTagName('select');
    const timeFormatSelectMenus = $id('time-format-settings').getElementsByTagName('select');

    for (let i in dateFormatSelectMenus) {
        const element = dateFormatSelectMenus[i];
        if (element.type === 'select-one') {
            element.setAttribute('onchange', commandString);
        }
    }

    for (let i in timeFormatSelectMenus) {
        const element = timeFormatSelectMenus[i];
        if (element.type === 'select-one') {
            element.setAttribute('onchange', commandString);
        }
    }
}

function updateDatetimeFormatPreview(format, modified = true) {
    if (modified) {
        $id('save-indicator').hidden = true;
        $id('unsaved-warning').hidden = false;
        const errorMessage = validateTimeZone('default-time-zone');
        if (errorMessage != undefined) {
            console.error(errorMessage);
            return;
        }
    }

    let now = dayjs().utc();
    const timeZoneData = getTimeZoneData('default-time-zone', +now);
    now = dayjs().tz(timeZoneData.identifier);

    if (format == undefined) {
        datetimeFormatPreview = buildDatetimeFormatString();
    } else {
        datetimeFormatPreview = format;
    }

    const nowString = now.format(datetimeFormatPreview);
    $id('datetime-format-preview').innerHTML = `${nowString} ${timeZoneData.abbreviation}`;
}

function buildDatetimeFormatString() {
    datetimeFormatPreviewComponents = {};
    for (const [component, selectMenuId] of Object.entries(componentSelectMenuIds)) {
        datetimeFormatPreviewComponents[component] = $id(selectMenuId).value;
    }
    const preview = new DatetimeFormats(datetimeFormatPreviewComponents);
    return preview.datetime;
}
