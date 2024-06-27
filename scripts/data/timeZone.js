const systemTimeZone = dayjs.tz.guess();
const validTimeZones = Intl.supportedValuesOf('timeZone');
const validTimeZonesHtmlString = buildValidTimeZonesHtmlString();

function buildValidTimeZonesHtmlString() {
    let htmlString = '';
    htmlString += `<option value=''>Type to filter or select</option>`;
    htmlString += `<option value='System (${systemTimeZone})'>System (${systemTimeZone})</option>`;
    for (let timeZone of validTimeZones) {
        let timeZoneLabel = timeZone;
        while (timeZoneLabel.includes('_')) {
            timeZoneLabel = timeZoneLabel.replace('_', ' ');
        }
        htmlString += `<option value='${timeZone}' label='${timeZoneLabel}'>${timeZone}</option>`;
    }
    return htmlString;
}

// 'default' source = default time zone
// other sources = time zone input IDs
function validateTimeZone(source, errorMessage) {

    const isInput = (source !== 'default');
    const value = isInput ? $id(source).value : storage.get('timeZone');

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
    }
}

function getTimeZoneData(source, timestamp) {
    const timeZoneData = {};
    const isDefault = (source === 'default');

    const value = isDefault ? storage.get('timeZone') : $id(source).value;
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

    if (timestamp != undefined) {
        const abbreviation = moment.tz.zone(isSystemTime ? systemTimeZone : value).abbr(timestamp);

        timeZoneData.abbreviation = (['+', '-'].includes(abbreviation[0])) ?
            `UTC${abbreviation}` : abbreviation;
    }

    const momentData = moment.tz.zone(timeZoneData.identifier);
    timeZoneData.offsets = momentData.offsets;
    timeZoneData.timeChanges = momentData.untils;

    return timeZoneData;
}
