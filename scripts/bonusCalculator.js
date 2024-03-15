// jshint esversion: 7

let quarterInputs;
let quarterYearInput;
let quarterInput;
let calculateQuarterDateRangeButton;

let quarterElement;
let quarterStartDateElement;
let quarterEndDateElement;
let quarterPayDateElement;
let quarterInfoElement;
let resetQuarterDateRangeButton;

let cohortAndAdvancementInputs;
let cohortRadioButtonGroupName;
let didCoachAdvanceTiersQuestion;
let tierAdvancementRadioButtonGroupName;
let tierSelectionElement;
let tierRadioButtonGroupName;

let cohortAndAdvancementInfoElement;

let sameTierQuarterlyHoursElement;
let calculateBonusForSingleTierButton;
let multiTierQuarterlyHoursElement;
let calculateBonusForMultiTierButton;

let month1Range;
let month2Range;
let month3Range;

let month1Personal;
let month1Creator;
let month1Career;
let month1Group;
let month1Parent;

let month2Personal;
let month2Creator;
let month2Career;
let month2Group;
let month2Parent;

let month3Personal;
let month3Creator;
let month3Career;
let month3Group;
let month3Parent;

let personalRate;
let creatorRate;
let careerRate;
let groupRate;
let parentRate;

let month1PersonalRate;
let month1CreatorRate;
let month1CareerRate;
let month1GroupRate;
let month1ParentRate;

let month2PersonalRate;
let month2CreatorRate;
let month2CareerRate;
let month2GroupRate;
let month2ParentRate;

let month3PersonalRate;
let month3CreatorRate;
let month3CareerRate;
let month3GroupRate;
let month3ParentRate;

let quarterStartDate;
let quarterEndDateAdjusted;

let cohort;
let tier;

let rates;

function prepareBonusCalculator() {
    quarterInputs = $id('quarter-inputs');
    quarterYearInput = $id('year-of-quarter');
    quarterInput = $id('quarter-selection');
    calculateQuarterDateRangeButton = $id('calculate-quarter-date-range-button');

    quarterElement = $id('quarter');
    quarterStartDateElement = $id('quarter-start-date');
    quarterEndDateElement = $id('quarter-end-date');
    quarterPayDateElement = $id('quarter-pay-date');
    quarterInfoElement = $id('calculated-quarter-info');
    resetQuarterDateRangeButton = $id('reset-quarter-date-range-button');

    cohortAndAdvancementInputs = $id('cohort-and-advancement-inputs');
    cohortRadioButtonGroupName = 'cohort-selection';
    didCoachAdvanceTiersQuestion = $id('did-coach-advance-tiers-question');
    tierAdvancementRadioButtonGroupName = 'did-coach-advance-tiers';
    tierSelectionElement = $id('tier-selection');
    tierRadioButtonGroupName = 'coach-tier';

    cohortAndAdvancementInfoElement = $id('cohort-and-advancement-info');

    sameTierQuarterlyHoursElement = $id('same-tier-quarterly-hours');
    calculateBonusForSingleTierButton = $id('calculate-bonus-for-single-tier-button');
    multiTierQuarterlyHoursElement = $id('multi-tier-quarterly-hours');
    calculateBonusForMultiTierButton = $id('calculate-bonus-for-multi-tier-button');

    month1Range = $id('month-1');
    month2Range = $id('month-2');
    month3Range = $id('month-3');

    month1Personal = $id('month-1-personal');
    month1Creator = $id('month-1-creator');
    month1Career = $id('month-1-career');
    month1Group = $id('month-1-group');
    month1Parent = $id('month-1-parent');

    month2Personal = $id('month-2-personal');
    month2Creator = $id('month-2-creator');
    month2Career = $id('month-2-career');
    month2Group = $id('month-2-group');
    month2Parent = $id('month-2-parent');

    month3Personal = $id('month-3-personal');
    month3Creator = $id('month-3-creator');
    month3Career = $id('month-3-career');
    month3Group = $id('month-3-group');
    month3Parent = $id('month-3-parent');

    personalRate = $id('personal-hour-rate');
    creatorRate = $id('creator-hour-rate');
    careerRate = $id('career-hour-rate');
    groupRate = $id('group-hour-rate');
    parentRate = $id('parent-hour-rate');

    month1PersonalRate = $id('personal-hour-rate-1');
    month1CreatorRate = $id('creator-hour-rate-1');
    month1CareerRate = $id('career-hour-rate-1');
    month1GroupRate = $id('group-hour-rate-1');
    month1ParentRate = $id('parent-hour-rate-1');

    month2PersonalRate = $id('personal-hour-rate-2');
    month2CreatorRate = $id('creator-hour-rate-2');
    month2CareerRate = $id('career-hour-rate-2');
    month2GroupRate = $id('group-hour-rate-2');
    month2ParentRate = $id('parent-hour-rate-2');

    month3PersonalRate = $id('personal-hour-rate-3');
    month3CreatorRate = $id('creator-hour-rate-3');
    month3CareerRate = $id('career-hour-rate-3');
    month3GroupRate = $id('group-hour-rate-3');
    month3ParentRate = $id('parent-hour-rate-3');

    quarterStartDate = null;
    quarterEndDateAdjusted = null;

    cohort = null;
    tier = null;

    rates = {
        'core': {
            'base': 20,
            'specialty': 23
        },
        'advanced': {
            'base': 25,
            'specialty': 28
        },
        'master': {
            'base': 30,
            'specialty': 33
        }
    };

    resetQuarterDateRange();
    autofillPreviousQuarter();

    console.log('%cbonus-calculator prepared', 'color: #00ff00');
}

function setQuarterInputSelectionColor() {
    quarterInput.className = quarterInput.options[quarterInput.selectedIndex].className;
}

function getCheckedRadioButton(radioGroupName) {
    return document.querySelector(`input[name=${radioGroupName}]:checked`);
}

function uncheckRadioButton(radioGroupName) {
    try {
        getCheckedRadioButton(radioGroupName).checked = false;
    } catch (error) {
        if (!error.message.includes('is null')) {
            throw error;
        }
    }
}

function resetQuarterDateRange() {
    calculateBonusForSingleTierButton.hidden = true;
    sameTierQuarterlyHoursElement.hidden = true;

    multiTierQuarterlyHoursElement.hidden = true;
    calculateBonusForMultiTierButton.hidden = true;

    cohortAndAdvancementInfoElement.hidden = true;
    tierSelectionElement.hidden = true;
    cohortAndAdvancementInputs.hidden = true;

    quarterInfoElement.hidden = true;

    quarterYearInput.value = '';
    quarterInput.value='';
    setQuarterInputSelectionColor();

    uncheckRadioButton('cohort-selection');
    uncheckRadioButton('did-coach-advance-tiers');
    uncheckRadioButton('coach-tier');

    quarterInputs.hidden = false;
}

function autofillPreviousQuarter() {
    const now = dayjs().utc();

    if (now.month() + 1 == 12 || now.month() + 1 <= 2) {
        quarterYearInput.value = now.year() - 1;
        quarterInput.value = 'Q4';
    } else if (now.month() + 1 >= 9) {
        quarterYearInput.value = now.year();
        quarterInput.value = 'Q3';

    } else if (now.month() + 1 >= 6) {
        quarterYearInput.value = now.year();
        quarterInput.value = 'Q2';

    } else if (now.month() + 1 >= 3) {
        quarterYearInput.value = now.year();
        quarterInput.value = 'Q1';

    } else {
        throw `Unexpected date: ${now.format(dateFormat)}`;
    }

    setQuarterInputSelectionColor();
}

function calculateQuarterDateRange() {
    const quarterInfo = {
        'Q1': {
            'yearAdjustment': -1,
            'startMonth': 12,
            'endMonth': 3
        },
        'Q2': {
            'yearAdjustment': 0,
            'startMonth': 3,
            'endMonth': 6
        },
        'Q3': {
            'yearAdjustment': 0,
            'startMonth': 6,
            'endMonth': 9
        },
        'Q4': {
            'yearAdjustment': 0,
            'startMonth': 9,
            'endMonth': 12
        }
    };

    const quarterYear = quarterYearInput.value;
    const quarter = quarterInput.value;

    const yearAdjustment = quarterInfo[quarter].yearAdjustment;
    const startMonth = quarterInfo[quarter].startMonth;
    const endMonth = quarterInfo[quarter].endMonth;
    const startYear = parseInt(quarterYear) + parseInt(yearAdjustment);

    quarterStartDate = dayjs(new Date(startYear, startMonth - 1, 26)).utc();
    const quarterEndDate = dayjs(new Date(quarterYear, endMonth - 1, 26)).utc();

    const quarterStartDateStr = quarterStartDate.format(dateFormat);
    quarterEndDateAdjusted = quarterEndDate.subtract(1, 'day');
    const quarterEndDateStr = quarterEndDateAdjusted.format(dateFormat);
    const quarterPayDateStr = quarterEndDateAdjusted.add(2, 'month').format(dateFormat);

    quarterElement.innerHTML = `${quarterYear} ${quarter}`;
    quarterStartDateElement.innerHTML = quarterStartDateStr;
    quarterEndDateElement.innerHTML = quarterEndDateStr;
    quarterPayDateElement.innerHTML = quarterPayDateStr;

    didCoachAdvanceTiersQuestion.innerHTML = `Did you advance tiers during ${quarterYear} ${quarter}?`;

    quarterInputs.hidden = true;
    quarterInfoElement.hidden = false;
    cohortAndAdvancementInputs.hidden = false;
}

function tierSelectionIsHidden(hidden) {
    tierSelectionElement.hidden = hidden;
}

function showQuarterlyHourInputs() {

    cohort = getCheckedRadioButton(cohortRadioButtonGroupName).value;

    let advancedTiers = null;
    if (getCheckedRadioButton(tierAdvancementRadioButtonGroupName).value === 'no') {
        advancedTiers = false;
    } else {
        advancedTiers = true;
    }

    tier = null;
    if (!advancedTiers) {
        tier = getCheckedRadioButton(tierRadioButtonGroupName).value;
    } else {
        tier = 'Multiple';
    }

    cohortAndAdvancementInfoElement.innerHTML = `Cohort ${cohort}<br>${tier} Tier<br><br>`;

    cohortAndAdvancementInputs.hidden = true;
    cohortAndAdvancementInfoElement.hidden = false;

    if (!advancedTiers) {
        populateRatesForSingleTier();
        sameTierQuarterlyHoursElement.hidden = false;
        calculateBonusForSingleTierButton.hidden = false;
        return;
    }

    month1Range.innerHTML = createStringForMonthInQuarter(1);
    month2Range.innerHTML = createStringForMonthInQuarter(2);
    month3Range.innerHTML = createStringForMonthInQuarter(3);

    populateRatesForMultiTier();

    multiTierQuarterlyHoursElement.hidden = false;
    calculateBonusForMultiTierButton.hidden = false;
}

function createStringForMonthInQuarter(month) {
    const startDate = quarterStartDate.add(month - 1, 'month').format(dateFormat);
    const endDate = quarterEndDateAdjusted.subtract(3 - month, 'month').format(dateFormat);

    return `${startDate} to ${endDate}`;
}

function populateRatesForSingleTier() {
    personalRate.innerHTML = rates[tier].base;
    creatorRate.innerHTML = rates[tier].specialty;
    careerRate.innerHTML = rates[tier].specialty;
    groupRate.innerHTML = rates[tier].specialty;
    parentRate.innerHTML = rates[tier].specialty;
}

function populateRatesForMultiTier() {
    return;
}

function createRateTable(advancedTiers) {
    if (!advancedTiers) {

        return `
        <table>
            ${createRow('Personal')}
            ${createRow('Creator')}
            ${createRow('Career')}
            ${createRow('Group')}
            ${createRow('Parent')}
        </table>
        `;

    } else {

        return `
        <table>
            ${'placeholder'}
        </table>
        `;

    }
}

function createRow(label) {

    const id = `quarterly-${label.toLowerCase()}-hours`;
    const rateId = `${label.toLowerCase()}-rate`;

    return `
    <tr>
        <th><label for=${id}>${label}</label></th>
        <td><input id=${id}
                   type=\'text\'
                   class=\'number\'
                   placeholder=\'0\'
                   style=\'width: 1.79rem\'</td>
        <td id=\'${rateId}\'
            class=\'annotation\'
            style=\'padding-left: 1rem\'></td>
    </tr>
    `;

}
