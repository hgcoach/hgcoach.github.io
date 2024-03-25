// jshint esversion: 10

let lastUsedFormat;
let is12HourTime;

function prepareTimeZoneConverter() {
    $id('time-zones').innerHTML = validTimeZonesHtmlString;
    $id('original-time-zone').value = getTimeZoneData('default').display;

    console.log('%cPrepared \'time-zone-converter\'', 'color: #88ff88');
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

    lastUsedFormat = (datetimeFormat == undefined) ? getDatetimeFormat() : datetimeFormat;

    $id('original-datetime').innerHTML =
        `${originalDatetime.format(lastUsedFormat)} ${originalTimeZone.abbreviation}`;
    $id('new-datetime').innerHTML =
        `${newDatetime.format(lastUsedFormat)} ${newTimeZone.abbreviation}`;

    is12HourTime = lastUsedFormat.includes('h');
    $id('switch-clock-format-button').innerHTML =
        is12HourTime ? 'Switch to 24-hour clock' : 'Switch to 12-hour clock';

    $id('switch-clock-format-button').hidden = false;
    $id('time-zone-conversion-results').hidden = false;
}

function populateCurrentTime() {
    const now = dayjs().tz(systemTimeZone);
    const date = now.format('YYYY-MM-DD');
    const time = now.format('HH:mm');

    $id('original-time-zone').value = `System (${systemTimeZone})`;
    $id('original-date').value = date;
    $id('original-time').value = time;
}

function switchClockFormat(button) {
    let otherClockFormat;

    if (lastUsedFormat.includes('h')) {
        switch (countInstances(lastUsedFormat, 'h')) {
            case 1:
                otherClockFormat = lastUsedFormat.replace('h', 'H');
                break;
            case 2:
                otherClockFormat = lastUsedFormat.replace('hh', 'HH');
                break;
        }
        otherClockFormat = otherClockFormat.replace('a', '').replace('A', '');
        button.innerHTML = 'Switch to 12-hour clock';
        is12HourTime = false;

    } else {
        switch (countInstances(lastUsedFormat, 'H')) {
            case 1:
                otherClockFormat = lastUsedFormat.replace('H:mm', 'h:mma');
                break;
            case 2:
                otherClockFormat = lastUsedFormat.replace('HH:mm', 'hh:mma');
                break;
        }
        button.innerHTML = 'Switch to 24-hour clock';
        is12HourTime = true;
    }

    convertToNewTimeZone(otherClockFormat);
}
