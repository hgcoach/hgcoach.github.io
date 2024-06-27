let is12HourTime;

function prepareTimeZoneConverter() {
    configureTimeZoneInput('original-time-zone', 'default');
    configureTimeZoneInput('new-time-zone');

    for (const inputId of ['original-date', 'original-time']) {
        setInputTextColor(inputId);
    }
    setUpInputBehaviorForConverter();

    console.log('%cPrepared \'time-zone-converter\'', 'color: #88ff88');
}

function setUpInputBehaviorForConverter() {
    for (const inputId of ['original-date', 'original-time']) {
        $id(inputId).setAttribute('onchange', `
                                   setInputTextColor('${inputId}')`);
    }
}

function convertToNewTimeZone(datetimeFormat) {
    const errorMessage = validateSeveral(
        validateTimeZone('original-time-zone'),
        validateDate('original-date'),
        validateTime('original-time'),
        validateTimeZone('new-time-zone'));

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const originalDate = $id('original-date').value;
    const originalTime = $id('original-time').value;

    const originalTimeZone = getTimeZoneData(
        'original-time-zone', `${originalDate}T${originalTime}:00`);
    const newTimeZone = getTimeZoneData('new-time-zone', originalTimeZone.unix);

    const originalDatetime = dayjs.tz(originalTimeZone.unix, originalTimeZone.identifier);

    const newDatetime = originalDatetime.tz(newTimeZone.identifier);

    if (datetimeFormat == undefined) {
        datetimeFormat = format.datetime;
    }

    $id('original-datetime').innerHTML =
        `${originalDatetime.format(datetimeFormat)} ${originalTimeZone.abbreviation}`;
    $id('new-datetime').innerHTML =
        `${newDatetime.format(datetimeFormat)} ${newTimeZone.abbreviation}`;

    is12HourTime = datetimeFormat.includes('h');
    $id('switch-clock-format-button').innerHTML =
        is12HourTime ? 'Show in 24-hour time' : 'Show in 12-hour time';

    $id('time-zone-conversion-results').hidden = false;
}

function populateCurrentTime() {
    let errorMessage = validateTimeZone('original-time-zone');
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const timeZoneData = getTimeZoneData('original-time-zone');
    const now = dayjs().tz(timeZoneData.identifier);
    const date = now.format('YYYY-MM-DD');
    const time = now.format('HH:mm');

    $id('original-date').value = date;
    $id('original-time').value = time;

    for (const inputId of ['original-date', 'original-time']) {
        setInputTextColor(inputId);
    }

    errorMessage = validateSeveral(
        validateDate('original-date'),
        validateTime('original-time'));

    if (errorMessage != undefined) {
        console.error(errorMessage);
    }
}

function switchClockFormatForConverter(button) {
    let newFormat;

    if (is12HourTime) {
        newFormat = format.datetime24Hour;
        button.innerHTML = 'Show in 12-hour time';
        is12HourTime = false;

    } else {
        newFormat = format.datetime12Hour;
        button.innerHTML = 'Show in 24-hour time';
        is12HourTime = true;
    }

    convertToNewTimeZone(newFormat);
}
