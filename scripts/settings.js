// jshint esversion: 8

let datetimeFormatPreview;

function prepareSettings() {
    $id('unsaved-warning').hidden = true;
    $id('save-indicator').hidden = true;
    mapCohortRadioButton();
    mapTierRadioButton();
    $id('time-zones').innerHTML = validTimeZonesHtmlString;
    $id('default-time-zone').value = getTimeZoneData('default').display;
    mapDatetimeFormatToRadioButtons();
    syncDatetimePreviewWithInputs();
    updateDatetimeFormatPreview(getDatetimeFormat(), false);

    console.log('%cPrepared \'settings\'', 'color: #88ff88');
}

function applySettings() {
    const errorMessage = validateTimeZone('default-time-zone');
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    storeDefaultCohort(getCheckedRadioButton('cohort'));

    storeDefaultTier(getCheckedRadioButton('tier'));

    const timeZoneData = getTimeZoneData('default-time-zone');
    const oldTimeZone = getDefaultTimeZone();

    if ((timeZoneData.isSystemTime && oldTimeZone !== 'System') ||
        (!timeZoneData.isSystemTime && timeZoneData.identifier !== oldTimeZone)) {
        storeDefaultTimeZone(getTimeZoneData('default-time-zone'));
    }

    if (datetimeFormatPreview !== getDatetimeFormat()) {
        storeDatetimeFormat(datetimeFormatPreview);
    }

    $id('unsaved-warning').hidden = true;
    temporarilyDisplaySaveIndicator();
}

function revertToDefaultSettings() {
    storeDefaultCohort(null);
    try { getCheckedRadioButton('cohort').checked = false; } catch (error) {}
    storeDefaultTier(null);
    try { getCheckedRadioButton('tier').checked = false; } catch (error) {}
    storeDefaultTimeZone('default');
    $id('default-time-zone').value = getTimeZoneData('default').display;
    validateTimeZone('default-time-zone');
    storeDatetimeFormat('default');
    mapDatetimeFormatToRadioButtons();
    updateDatetimeFormatPreview(getDatetimeFormat(), false);
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
    $id('save-indicator').hidden = false;
    await sleep(3000);
    try {
        $id('save-indicator').hidden = true;
    } catch (error) {
        if (currentTool === 'settings') {
            throw error;
        }
    }
}

function mapCohortRadioButton() {
    const storedCohort = getDefaultCohort();
    if (storedCohort == null || storedCohort === 'null') {
        return;
    } else if (storedCohort === '0-5') {
        $id('cohort-0-to-5-radio-button').checked = true;
    } else if (storedCohort === '6+') {
        $id('cohort-6-plus-radio-button').checked = true;
    } else {
        throw new Error(`Invalid cohort: '${storedCohort}'`);
    }
}

function mapTierRadioButton() {
    const storedTier = getDefaultTier();
    if (storedTier == null || storedTier === 'null') {
        return;
    } else if (storedTier === 'core') {
        $id('core-tier').checked = true;
    } else if (storedTier === 'advanced') {
        $id('advanced-tier').checked = true;
    } else if (storedTier === 'master') {
        $id('master-tier').checked = true;
    } else {
        throw new Error(`Invalid tier: '${storedTier}'`);
    }
}

function mapDatetimeFormatToRadioButtons() {

    const format = getDatetimeFormat();

    if (format.indexOf('Y') < format.indexOf('M')) {
        $id('date-order-ymd').checked = true;
    } else if (format.indexOf('D') < format.indexOf('M')) {
        $id('date-order-dmy').checked = true;
    } else if (format.indexOf('M') < format.indexOf('D')) {
        $id('date-order-mdy').checked = true;
    } else {
        throw new Error(`No matching case for date order format: ${format}`);
    }

    if (format === format.replace('ddd', '')) {
        $id('no-dotw').checked = true;
    } else if (format.indexOf('ddd') == 0) {
        $id('prepend-dotw').checked = true;
    } else if (format[format.indexOf('ddd') - 1] === '(') {
        $id('append-dotw').checked = true;
    } else {
        throw new Error(`No matching case for day of the week format: ${format}`);
    }

    const countY = format.split('Y').length - 1;
    switch (countY) {
        case 4:
            $id('4-digit-year').checked = true;
            break;
        case 2:
            if (!format.includes('\'')) {
                $id('2-digit-year').checked = true;
            } else {
                $id('2-digit-apostrophized').checked = true;
            }
            break;
        default:
            throw new Error(`No matching case for year format: ${format}`);
    }

    const countM = format.split('M').length - 1;
    switch (countM) {
        case 2:
            $id('0-padded-number-month').checked = true;
            break;
        case 1:
            $id('number-month').checked = true;
            break;
        case 3:
            $id('abbreviated-month').checked = true;
            break;
        case 4:
            $id('full-month').checked = true;
            break;
        default:
            throw new Error(`No matching case for month format: ${format}`);
    }

    const countD = format.split('D').length - 1;
    switch (countD) {
        case 2:
            $id('0-padded-number-day').checked = true;
            break;
        case 1:
            if (!format.includes('Do')) {
                $id('number-day').checked = true;
            } else {
                $id('ordinal-day').checked = true;
            }
            break;
        default:
            throw new Error(`No matching case for day format: ${format}`);
    }

    const countSpaces = format.split(' ').length;
    const firstCharAfterLastSpace = format.split(' ')[format.length - 1];

    if (format.includes('-')) {
        $id('hyphen-separator').checked = true;
    } else if (format.includes('/')) {
        $id('slash-separator').checked = true;
    } else if (countSpaces >= 4 ||
               (countSpaces === 3 &&
                (!format.includes('Do') ||
                 firstCharAfterLastSpace != 'a' ||
                 firstCharAfterLastSpace != 'A')
                )
               ) {
        $id('space-separator').checked = true;
    } else {
        throw new Error(`No matching case for date separator format: ${format}`);
    }

    let countH;

    if (format.includes('H')) {
        $id('24-hour-clock').checked = true;
        countH = format.split('H').length - 1;
    } else if (format.includes('h')) {
        $id('12-hour-clock').checked = true;
        countH = format.split('h').length - 1;
    } else {
        throw new Error(`No matching case for clock format: ${format}`);
    }

    switch (countH) {
        case 2:
            $id('0-padded-number-hour').checked = true;
            break;
        case 1:
            $id('number-hour').checked = true;
            break;
        default:
            throw new Error(`No matching case for hour format: ${format}`);
    }

    if (format.includes('a')) {
        if (format[format.indexOf('a') - 1] != ' ') {
            $id('lowercase-am-pm').checked = true;
        } else {
            $id('lowercase-spaced-am-pm').checked = true;
        }
    } else if (format.includes('A')) {
        if (format[format.indexOf('A') - 1] != ' ') {
            $id('uppercase-am-pm').checked = true;
        } else {
            $id('uppercase-spaced-am-pm').checked = true;
        }
    } else {
        $id('lowercase-am-pm').checked = true;
    }
}

function syncDatetimePreviewWithInputs() {
    const commandString = 'updateDatetimeFormatPreview()';

    for (const radioButtonId of ['cohort-0-to-5-radio-button', 'cohort-6-plus-radio-button',
                                 'core-tier', 'advanced-tier', 'master-tier',
                                 'default-time-zone']) {
        $id(radioButtonId).setAttribute('onchange', commandString);
    }

    const dateFormatRadioButtons = $id('date-format-settings').getElementsByTagName('input');
    const timeFormatRadioButtons = $id('time-format-settings').getElementsByTagName('input');

    for (let i in dateFormatRadioButtons) {
        const element = dateFormatRadioButtons[i];
        if (element.type === 'radio') {
            element.setAttribute('onchange', commandString);
        }
    }

    for (let i in timeFormatRadioButtons) {
        const element = timeFormatRadioButtons[i];
        if (element.type === 'radio') {
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
    const components = {
        'order': getCheckedRadioButton('date-order-setting').value,
        'dayOfTheWeekPosition': getCheckedRadioButton('day-of-the-week-setting').value,
        'year': getCheckedRadioButton('year-format-setting').value,
        'month': getCheckedRadioButton('month-format-setting').value,
        'day': getCheckedRadioButton('day-format-setting').value,
        'separator': getCheckedRadioButton('date-separator-setting').value,
        'clock': getCheckedRadioButton('clock-format-setting').value,
        'hourDigits': getCheckedRadioButton('hour-format-setting').value,
        'amPm': getCheckedRadioButton('am-pm-format-setting').value,
    };

    const year = components.year;
    const month = components.month;
    const day = components.day;
    const dayOfTheWeek = 'ddd';
    const separator = components.separator;

    const hour = components.clock.repeat(components.hourDigits);
    const minute = 'mm';
    const amPm = components.clock == 'h' ? components.amPm : '';
    const time = `${hour}:${minute}${amPm}`;

    let date = [];
    let commaNeeded = false;
    switch (components.order) {
        case 'year month day':
            date.push(year, month, day);
            break;
        case 'day month year':
            date.push(day, month, year);
            break;
        case 'month day year':
            date.push(month, day, year);
            commaNeeded = day !== 'Do';
            break;
        default:
            throw new Error(`No matching case for date order ${components.order}`);
    }

    switch (components.separator) {
        case '-':
        case '/':
            date = date.join(components.separator);
            break;
        case 'space':
            if (commaNeeded) {
                date = `${date[0]} ${date[1]}, ${date[2]}`;
            } else {
                date = date.join(' ');
            }
            break;
        default:
            throw new Error(`No matching case for date separator ${components.separator}`);
    }

    switch (components.dayOfTheWeekPosition) {
        case 'none':
            break;
        case 'prepend':
            date = `${dayOfTheWeek} ${date}`;
            break;
        case 'append':
            date += ` (${dayOfTheWeek})`;
            break;
        default:
            throw new Error(`No matching case for day of the week position ${components.dayOfTheWeekPosition}`);
    }

    return `${date} ${time}`;
}
