// jshint esversion: 7

let endYearElement;
let endMonthElement;
let endDateElement;
let editableEndDateSpan;
let calculateDateRangesButton;
let averageHoursResetButton;

let sixMonthStartDateElement;
let threeMonthStartDateElement;
let workedHoursDiv;
let averageHoursResultDiv;

let sixMonthWorkedHoursElement;
let threeMonthWorkedHoursElement;
let calculateAverageHoursButton;
let averageHoursElement;
let averageHoursBreakdownButton;
let averageHoursBreakdownElement;

let endYear;
let endMonth;
let endDate;
let sixMonthStartDate;
let threeMonthStartDate;

function prepareAverageHoursCalculator() {
    endYearElement = $id('billing-period-end-year');
    endMonthElement = $id('billing-period-end-month');
    endDateElement = $id('billing-period-end-date');
    editableEndDateSpan = $id('editable-billing-period-end-date');
    calculateDateRangesButton = $id('calculate-date-ranges-button');
    averageHoursResetButton = $id('billing-period-date-reset-button');

    sixMonthStartDateElement = $id('6-month-start-date');
    threeMonthStartDateElement = $id('3-month-start-date');
    workedHoursDiv = $id('worked-hours-inputs');
    averageHoursResultDiv = $id('average-hours-results');

    sixMonthWorkedHoursElement = $id('6-month-worked-hours');
    threeMonthWorkedHoursElement = $id('3-month-worked-hours');
    calculateAverageHoursButton = $('calculate-average-hours-button');
    averageHoursElement = $id('average-weekly-hours');
    averageHoursBreakdownButton = $id('toggle-average-hours-breakdown-button');
    averageHoursBreakdownElement = $id('average-weekly-hours-breakdown');

    endYear = null;
    endMonth = null;
    endDate = null;
    sixMonthStartDate = null;
    threeMonthStartDate = null;

    bindKeyPressToFocus(endYearElement, 'Enter', endMonthElement);
    bindKeyPressToButton(endMonthElement, 'Enter', calculateDateRangesButton);
    bindKeyPressToFocus(sixMonthWorkedHoursElement, 'Enter', threeMonthWorkedHoursElement);
    bindKeyPressToButton(threeMonthWorkedHoursElement, 'Enter', calculateAverageHoursButton);

    resetAverageWeeklyHoursCalculator();
    autofillCurrentOrRecentBillingPeriod();

    console.log('%caverage-hours-calculator prepared', 'color: #00ff00');
}

function autofillCurrentOrRecentBillingPeriod() {
    const now = dayjs().utc();
    endYearElement.value = now.year();
    endMonthElement.value = now.month() + 1;
}

function calculateStartDates() {

    validateEndDate();

    endYear = parseInt(endYearElement.value);
    endMonth = parseInt(endMonthElement.value);

    endDate = dayjs(new Date(endYear, endMonth - 1, 26)).utc();
    endDateElement.innerHTML = endDate.subtract(1, 'day').format(dateFormat);
    lockEndDate(true);

    sixMonthStartDate = endDate.subtract(6, 'month');
    threeMonthStartDate = endDate.subtract(3, 'month');

    sixMonthStartDateElement.innerHTML = sixMonthStartDate.format(dateFormat);
    threeMonthStartDateElement.innerHTML = threeMonthStartDate.format(dateFormat);

    averageHoursResultDiv.hidden = true;
    workedHoursDiv.hidden = false;

    sixMonthWorkedHoursElement.focus();

}

function validateEndDate() {

    const errorMessages = [];
    const endYearErrorMessage = 'Year must be an integer ≥ 100';
    const endMonthErrorMessage = 'Month must be an integer 1-12';

    if (!yearElementIsValid(endYearElement)) {
        errorMessages.push(endYearErrorMessage);
        endYearElement.classList.add('error');
    } else {
        removeValueFromArray(errorMessages, endYearErrorMessage);
        endYearElement.classList.remove('error');
    }

    if (!monthElementIsValid(endMonthElement)) {
        errorMessages.push(endMonthErrorMessage);
        endMonthElement.classList.add('error');
    } else {
        removeValueFromArray(errorMessages, endMonthErrorMessage);
        endMonthElement.classList.remove('error');
    }

    if (errorMessages.length > 0) {
        throw errorMessages.join('; ');
    }
}

function lockEndDate(isLocked) {
    editableEndDateSpan.hidden = isLocked;
    calculateDateRangesButton.hidden = isLocked;

    endDateElement.hidden = !isLocked;
    averageHoursResetButton.hidden = !isLocked;
}

function toggleAverageHoursBreakdown() {
    averageHoursBreakdownElement.hidden = !averageHoursBreakdownElement.hidden;
    if (averageHoursBreakdownButton.value === 'Show breakdown') {
        averageHoursBreakdownButton.value = 'Hide breakdown';
    } else {
        averageHoursBreakdownButton.value = 'Show breakdown';
    }
}

function yearElementIsValid(yearElement) {
    return yearElement.value.length > 0 &&
           validNonNegativeInteger.test(yearElement.value) &&
           parseInt(yearElement.value) >= 100;
}

function monthElementIsValid(monthElement) {
    return monthElement.value.length > 0 &&
           validNonNegativeInteger.test(monthElement.value) &&
           parseInt(monthElement.value) > 0 &&
           parseInt(monthElement.value) <= 12;
}

function calculateAverageWeeklyHours() {

    if (!validNonNegativeNumber.test(sixMonthWorkedHoursElement.value) ||
        !validNonNegativeNumber.test(threeMonthWorkedHoursElement.value)) {
        throw 'Worked hours must be a non-negative number';
    }

    let sixMonthWorkedHours = null;
    let threeMonthWorkedHours = null;

    if (sixMonthWorkedHoursElement.value.length > 0) {
        sixMonthWorkedHours = parseFloat(sixMonthWorkedHoursElement.value);
    } else {
        sixMonthWorkedHours = parseFloat(sixMonthWorkedHoursElement.placeholder);
    }

    if (threeMonthWorkedHoursElement.value.length > 0) {
        threeMonthWorkedHours = parseFloat(threeMonthWorkedHoursElement.value);
    } else {
        threeMonthWorkedHours = parseFloat(threeMonthWorkedHoursElement.placeholder);
    }

    const sixMonthDays = endDate.diff(sixMonthStartDate, 'day');
    const threeMonthDays = endDate.diff(threeMonthStartDate, 'day');

    const sixMonthWeeks = (sixMonthDays / 7);
    const threeMonthWeeks = (threeMonthDays / 7);

    const sixMonthAverageHours = sixMonthWorkedHours / sixMonthWeeks;
    const threeMonthAverageHours = threeMonthWorkedHours / threeMonthWeeks;
    const averageWeeklyHours = Math.max(sixMonthAverageHours, threeMonthAverageHours);

    averageHoursElement.innerHTML = roundDecimal(averageWeeklyHours, 3);

    const endDateStr = endDate.subtract(1, 'day').format(dateFormat);
    const sixMonthStartDateStr = sixMonthStartDate.format(dateFormat);
    const sixMonthAverageHoursStr = roundDecimal(sixMonthAverageHours, 3);
    const threeMonthStartDateStr = threeMonthStartDate.format(dateFormat);
    const threeMonthAverageHoursStr = roundDecimal(threeMonthAverageHours, 3);
    const averageHoursMaxStr = roundDecimal(Math.max(sixMonthAverageHours, threeMonthAverageHours), 3);
    const averageHoursMinStr = roundDecimal(Math.min(sixMonthAverageHours, threeMonthAverageHours), 3);

    let averageHoursComparison = null;
    if (sixMonthAverageHours == threeMonthAverageHours) {
        averageHoursComparison = '=';
    } else {
        averageHoursComparison = '>';
    }

    averageHoursBreakdownElement.innerHTML = `<br><br>
        <strong>Formula</strong><br>
        Total weeks = Total days / 7<br>
        Average weekly hours = Total hours / Total weeks<br>
        Take the greater of the two averages<br><br>

        <strong>Calculations</strong><br>
        ${sixMonthStartDateStr} to ${endDateStr} = ${sixMonthDays}d<br>
        ${sixMonthDays}d / 7 = ${sixMonthWeeks}wk<br>
        ${sixMonthWorkedHours}hr / ${sixMonthWeeks}wk = ${sixMonthAverageHoursStr} hr/wk<br><br>

        ${threeMonthStartDateStr} to ${endDateStr} = ${threeMonthDays}d<br>
        ${threeMonthDays}d / 7 = ${threeMonthWeeks}wk<br>
        ${threeMonthWorkedHours}hr / ${threeMonthWeeks}wk = ${threeMonthAverageHoursStr} hr/wk<br><br>

        <span class='accented'>
        ${averageHoursMaxStr} hr/wk
        </span> ${averageHoursComparison} ${averageHoursMinStr} hr/wk`;

    averageHoursResultDiv.hidden = false;
}

function roundDecimal(number, decimalPlaces) {
    const power = 10 ** decimalPlaces;
    const roundedNumber = Math.round((number + Number.EPSILON) * power) / power;
    return roundedNumber;
}

function resetAverageWeeklyHoursCalculator() {
    workedHoursDiv.hidden = true;
    averageHoursResultDiv.hidden = true;

    endYearElement.value = '';
    endYearElement.classList.remove('error');

    endMonthElement.value = '';
    endMonthElement.classList.remove('error');

    sixMonthWorkedHoursElement.value = '';
    threeMonthWorkedHoursElement.value = '';

    lockEndDate(false);
}

function removeValueFromArray(array, value) {
    const index = array.indexOf(value);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
