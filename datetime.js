// jshint esversion: 8

validateDatetimeFormat('default');

function validateDatetimeFormat(source) {
    if (source !== 'default') {
        throw new Error('Only \'default\' is a valid source.');
    }

    const format = getDatetimeFormat();

    try {
        if (format.includes('Y') &
            format.includes('M') &
            format.includes('D') &
            (format.includes('H') || format.includes('h')) &
            format.includes(':') &
            format.includes('m') &
            [2, 4].includes(countInstances(format, 'Y')) &
            [1, 2, 3, 4].includes(countInstances(format, 'M')) &
            [1, 2].includes(countInstances(format, 'D')) &
            [0, 1, 2].includes(countInstances(format, 'H')) &
            [0, 1, 2].includes(countInstances(format, 'h')) &
            2 === countInstances(format, 'm')) {

            return;

        } else {
            storeDatetimeFormat('default', true);
        }
    } catch (error) {
        if (!error.message.includes('is null')) {
            throw error;   
        }

        storeDatetimeFormat('default', true);
    }
}

function getDatetimeFormat() {
    return localStorage.getItem('datetimeFormat');
}

function storeDatetimeFormat(format, isRepair) {
    oldDatetimeFormat = getDatetimeFormat();
    localStorage.setItem('datetimeFormat',
                         (format === 'default') ? 'ddd MMM Do YYYY h:mma' : format);
    outputStorageUpdate('datetimeFormat', oldDatetimeFormat, isRepair);
}

function getDateFormat() {
    const datetimeFormat = localStorage.getItem('datetimeFormat');
    const indexLowerH = datetimeFormat.indexOf('h');
    const indexUpperH = datetimeFormat.indexOf('H');

    let indexHour;

    if (indexLowerH != -1) {
        indexHour = indexLowerH;
    } else if (indexUpperH != -1) {
        indexHour = indexUpperH;
    } else {
        throw new Error(`Unable to compute date format from datetime format: ${datetimeFormat}`);
    }

    return datetimeFormat.slice(0, indexHour - 1);
}

function validateYear(inputId, errorMessage) {
    const year = $id(inputId).value;

    if (year.length > 0 &&
        validNonNegativeInteger.test(year) &&
        parseInt(year) >= 100) {

        removeErrorState(inputId);

    } else {

        if (errorMessage == undefined) {
            errorMessage = `Year must be an integer ≥ 100... got '${year}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }
}

function validateMonth(inputId, errorMessage) {
    const month = $id(inputId).value;

    if (month.length > 0 &&
        validNonNegativeInteger.test(month) &&
        parseInt(month) > 0 &&
        parseInt(month) <= 12) {

        removeErrorState(inputId);

    } else {

        if (errorMessage == undefined) {
            errorMessage = `Month must be an integer 1-12... got '${month}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }
}

function validateDate(inputId, errorMessage) {
    const date = $id(inputId).value;

    if (!validDate.test(date)) {

        if (errorMessage == undefined) {
            errorMessage = `Date invalid: '${date}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }

    removeErrorState(inputId);
}

function validateTime(inputId, errorMessage) {
    const time = $id(inputId).value;

    if (!validTime.test(time)) {

        if (errorMessage == undefined) {
            errorMessage = `Time invalid: '${time}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }

    removeErrorState(inputId);
}
