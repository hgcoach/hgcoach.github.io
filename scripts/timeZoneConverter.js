// jshint esversion: 10

function prepareTimeZoneConverter() {
    loadTimezoneData();
    autofillSystemTimezone();

    console.log('%ctime-zone-converter prepared', 'color: #00ff00');
}

function loadTimezoneData() {
    let htmlStr = '';
    for (const timezone of Intl.supportedValuesOf('timeZone')) {
        htmlStr += `<option value=\'${timezone}\'></option>`;
    }

    $id('timezones').innerHTML = htmlStr;
}

function autofillSystemTimezone() {
    $id('coach-timezone').value = dayjs.tz.guess();
}

function convertToClientTimezone() {

    validateInputs();

    const coachTimezone = $id('coach-timezone').value;
    const clientTimezone = $id('client-timezone').value;

    const coachDatetime = dayjs($id('coach-datetime').value, coachTimezone);
    const clientDatetime = coachDatetime.tz(clientTimezone);

    $id('client-datetime').innerHTML = clientDatetime.format(datetimeFormat);
    $id('client-datetime-label').hidden = false;
}

function validateInputs() {

    errorMessages = [];
    testDate = dayjs(new Date().toLocaleDateString()).utc();
    let testDateConverted = null;

    try {
        testDateConverted = testDate.tz($id('coach-timezone').value);
        $id('coach-timezone').classList.remove('error');
    } catch (error) {
        if (error.message.includes('invalid time zone')) {
            $id('coach-timezone').classList.add('error');
            errorMessages.push('Coach timezone invalid');
        } else {
            throw error;
        }
    }

    if ($id('coach-datetime').value.length < 1) {
        $id('coach-datetime').classList.add('error');
        errorMessages.push('Datetime invalid');
    } else {
        $id('coach-datetime').classList.remove('error');
    }

    try {
        testDateConverted = testDate.tz($id('client-timezone').value);
        $id('client-timezone').classList.remove('error');
    } catch (error) {
        if (error.message.includes('invalid time zone')) {
            $id('client-timezone').classList.add('error');
            errorMessages.push('Client timezone invalid');
        } else {
            throw error;
        }
    }

    if (errorMessages.length > 0) {
        throw errorMessages.join('; ');
    }
}
