<<<<<<< HEAD
// jshint esversion: 6

const systemTimeZone = dayjs.tz.guess();
const validTimeZones = Intl.supportedValuesOf('timeZone');
const validTimeZonesHtmlString = buildValidTimeZonesHtmlString();

validateTimeZone('default');

function buildValidTimeZonesHtmlString() {
    let htmlString = '';
    htmlString += `<option value=\'System (${systemTimeZone})\'></option>`;
    for (const timeZone of validTimeZones) {
        htmlString += `<option value=\'${timeZone}\'></option>`;
    }
    return htmlString;
}

function getDefaultTimeZone() {
    return localStorage.getItem('defaultTimeZone');
}

function storeDefaultTimeZone(timeZoneData, isRepair) {
    let defaultTimeZone;

    if (timeZoneData === 'default' || timeZoneData.isSystemTime) {
        defaultTimeZone = 'System';
    } else {
        defaultTimeZone = timeZoneData.identifier;
    }

    oldTimeZone = getDefaultTimeZone();
    localStorage.setItem('defaultTimeZone', defaultTimeZone);
    outputStorageUpdate('defaultTimeZone', oldTimeZone, isRepair);
}

// 'default' source = default time zone
// other sources = time zone input IDs
function validateTimeZone(source, errorMessage) {

    const isInput = (source !== 'default');
    const value = isInput ? $id(source).value : getDefaultTimeZone();

    if ((!isInput && value === 'System') ||
        (isInput && value === `System (${systemTimeZone})`) ||
        validTimeZones.includes(value)) {

        if (isInput) {
            removeErrorState(source);
        }
        return;
    }

    if (isInput) {

        if (errorMessage == undefined) {
            errorMessage = `Time zone invalid: '${value}'`;
        }

        applyErrorState(source);
        return errorMessage;

    } else {
        storeDefaultTimeZone('default', true);
    }
}

function getTimeZoneData(source, timestamp) {
    const timeZoneData = {};
    const isDefault = (source === 'default');

    const value = isDefault ? getDefaultTimeZone() : $id(source).value;
    timeZoneData.value = value;
    let isSystemTime;

    if (isDefault) {
        isSystemTime = (value === 'System');
        timeZoneData.display = isSystemTime ? `System (${systemTimeZone})` : value;

    } else {
        isSystemTime = value === `System (${systemTimeZone})`;
        timeZoneData.display = value;
    }

    timeZoneData.isSystemTime = isSystemTime;
    timeZoneData.identifier = isSystemTime ? systemTimeZone : value;

    if (typeof timestamp == 'string' && timestamp.includes('T')) {
        timestamp = +dayjs.tz(timestamp, timeZoneData.identifier);
    }

    timeZoneData.unix = timestamp;
    timeZoneData.abbreviation = (timestamp != undefined) ?
        moment.tz.zone(isSystemTime ? systemTimeZone : value).abbr(timestamp) :
        undefined;

    return timeZoneData;
}
=======
// jshint esversion: 6

const systemTimeZone = dayjs.tz.guess();
const validTimeZones = Intl.supportedValuesOf('timeZone');
const validTimeZonesHtmlString = buildValidTimeZonesHtmlString();

validateTimeZone('default');

function buildValidTimeZonesHtmlString() {
    let htmlString = '';
    htmlString += `<option value=\'System (${systemTimeZone})\'></option>`;
    for (const timeZone of validTimeZones) {
        htmlString += `<option value=\'${timeZone}\'></option>`;
    }
    return htmlString;
}

function getDefaultTimeZone() {
    return localStorage.getItem('defaultTimeZone');
}

function storeDefaultTimeZone(timeZoneData, isRepair) {
    let defaultTimeZone;

    if (timeZoneData === 'default' || timeZoneData.isSystemTime) {
        defaultTimeZone = 'System';
    } else {
        defaultTimeZone = timeZoneData.identifier;
    }

    oldTimeZone = getDefaultTimeZone();
    localStorage.setItem('defaultTimeZone', defaultTimeZone);
    outputStorageUpdate('defaultTimeZone', oldTimeZone, isRepair);
}

// 'default' source = default time zone
// other sources = time zone input IDs
function validateTimeZone(source, errorMessage) {

    const isInput = (source !== 'default');
    const value = isInput ? $id(source).value : getDefaultTimeZone();

    if ((!isInput && value === 'System') ||
        (isInput && value === `System (${systemTimeZone})`) ||
        validTimeZones.includes(value)) {

        if (isInput) {
            removeErrorState(source);
        }
        return;
    }

    if (isInput) {

        if (errorMessage == undefined) {
            errorMessage = `Time zone invalid: '${value}'`;
        }

        applyErrorState(source);
        return errorMessage;

    } else {
        storeDefaultTimeZone('default', true);
    }
}

function getTimeZoneData(source, timestamp) {
    const timeZoneData = {};
    const isDefault = (source === 'default');

    const value = isDefault ? getDefaultTimeZone() : $id(source).value;
    timeZoneData.value = value;
    let isSystemTime;

    if (isDefault) {
        isSystemTime = (value === 'System');
        timeZoneData.display = isSystemTime ? `System (${systemTimeZone})` : value;

    } else {
        isSystemTime = value === `System (${systemTimeZone})`;
        timeZoneData.display = value;
    }

    timeZoneData.isSystemTime = isSystemTime;
    timeZoneData.identifier = isSystemTime ? systemTimeZone : value;

    if (typeof timestamp == 'string' && timestamp.includes('T')) {
        timestamp = +dayjs.tz(timestamp, timeZoneData.identifier);
    }

    timeZoneData.unix = timestamp;
    timeZoneData.abbreviation = (timestamp != undefined) ?
        moment.tz.zone(isSystemTime ? systemTimeZone : value).abbr(timestamp) :
        undefined;

    return timeZoneData;
}
>>>>>>> 4a789041cc4bf8c8831c5515259e265ce84182bc
