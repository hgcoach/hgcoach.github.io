<<<<<<< HEAD
// jshint esversion: 7

let dateFormat;

let quarterYear;
let quarter;

let quarterStartDate;
let quarterEndDateAdjusted;
let cohort;
let medianHoursSelection;
let psfRatingMet;
let highDemandSlotsMet;

const incentives = {
    'psfRating': {
        'core': 2,
        'advanced': 3,
        'master': 4
    },
    'medianHours': {
        'core': {
            '13+': 2,
            '17+': 6,
            '20+': 12,
            '24+': 15
        },
        'advanced': {
            '13+': 3,
            '17+': 8,
            '20+': 15,
            '24+': 19
        },
        'master': {
            '13+': 4,
            '17+': 10,
            '20+': 18,
            '24+': 23
        }
    },
    'highDemandSlots': {
        'core': 2,
        'advanced': 2,
        'master': 2
    }
};

const rates = {
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

function prepareBonusCalculator() {
    resetBonusCalculator();
    autofillPreviousQuarter();
    dateFormat = getDateFormat();
    selectDefaultCohort();

    console.log('%cPrepared \'bonus-calculator\'', 'color: #88ff88');
}

function resetBonusCalculator() {
    toggleVisibility('bonus-results', false);

    $id('calculate-bonus-for-single-tier-button').hidden = true;
    $id('same-tier-quarterly-hours').hidden = true;

    $id('multi-tier-quarterly-hours').hidden = true;
    $id('calculate-bonus-for-multi-tier-button').hidden = true;

    $id('cohort-and-incentive-info').hidden = true;
    $id('cohort-advancement-and-incentive-inputs').hidden = true;

    $id('calculated-quarter-info').hidden = true;

    $id('year-of-quarter').value = '';
    $id('quarter-selection').value='';
    setInputSelectionColor('quarter-selection');

    uncheckRadioButton('cohort-selection');
    uncheckRadioButton('did-coach-advance-tiers');
    uncheckRadioButton('median-hours');
    $id('psf-rating').checked = false;
    $id('high-demand-slots').checked = false;

    for (const suffix of ['', '-1', '-2', '-3']) {
        uncheckRadioButton(`coach-tier${suffix}`);
        for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
            $id(`quarterly-${type}-hours${suffix}`).value = '';
        }
    }

    autofillPreviousQuarter();
    selectDefaultCohort();
    $id('quarter-inputs').hidden = false;
}

function autofillPreviousQuarter() {
    const now = dayjs().utc();
    const quarterYearInput = $id('year-of-quarter');
    const quarterInput = $id('quarter-selection');

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

    setInputSelectionColor('quarter-selection');
}

function selectDefaultCohort() {
    const storedCohort = getDefaultCohort();
    switch (storedCohort) {
        case null:
        case 'null':
            break;
        case '0-5':
            $id('cohort-0-to-5-radio-button').checked = true;
            break;
        case '6+':
            $id('cohort-6-plus-radio-button').checked = true;
            break;
        default:
            throw new Error(`Invalid cohort: '${storedCohort}'`);
    }
}

function selectDefaultTier() {
    if ($id('did-coach-advance-tiers').checked) {
        return;
    }

    const storedTier = getDefaultTier();
    switch (storedTier) {
        case null:
        case 'null':
            break;
        case 'core':
            for (const suffix of ['', '-1', '-2', '-3']) {
                $id(`coach-tier-core${suffix}`).checked = true;
                populateRates(suffix);
            }
            break;
        case 'advanced':
            for (const suffix of ['', '-1', '-2', '-3']) {
                $id(`coach-tier-advanced${suffix}`).checked = true;
                populateRates(suffix);
            }
            break;
        case 'master':
            for (const suffix of ['', '-1', '-2', '-3']) {
                $id(`coach-tier-master${suffix}`).checked = true;
                populateRates(suffix);
            }
            break;
        default:
            throw new Error(`Invalid Master tier: '${storedTier}'`);
    }
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

    quarterYear = $id('year-of-quarter').value;
    quarter = $id('quarter-selection').value;

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

    $id('quarter').innerHTML = `${quarterYear} ${quarter}`;
    $id('quarter-start-date').innerHTML = quarterStartDateStr;
    $id('quarter-end-date').innerHTML = quarterEndDateStr;
    $id('quarter-pay-date').innerHTML = quarterPayDateStr;

    $id('did-coach-advance-tiers-question').innerHTML = `Did you advance tiers during ${quarterYear} ${quarter}?`;

    $id('quarter-inputs').hidden = true;
    $id('calculated-quarter-info').hidden = false;
    $id('cohort-advancement-and-incentive-inputs').hidden = false;
}

function showQuarterlyHourInputs() {

    const errorMessage = validateSeveral(
        validateRadioGroupChecked('cohort-selection'),
        validateRadioGroupChecked('did-coach-advance-tiers'),
        validateRadioGroupChecked('median-hours'));

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    cohort = getCheckedRadioButton('cohort-selection').value;

    const advancedTiers = getCheckedRadioButton('did-coach-advance-tiers').value === 'yes';
    medianHoursSelection = getCheckedRadioButton('median-hours').value;
    psfRatingMet = $id('psf-rating').checked;
    highDemandSlotsMet = $id('high-demand-slots').checked;

    $id('cohort-and-incentive-info').innerHTML =
        `<span class='accented'>Cohort ${cohort}</span><br>
        <span class='accented'>${advancedTiers ? 'Did' : 'Didn\'t'} advance</span> tiers<br>
        <span class='accented'>${medianHoursSelection}</span> median coaching hours<br>
        <span class='accented'>${psfRatingMet ? 'Did' : 'Didn\'t'} meet</span> PSF rating requirement<br>
        <span class='accented'>${highDemandSlotsMet ? '4+' : 'Less than 4'}</span> high-demand slots worked`;

    $id('cohort-advancement-and-incentive-inputs').hidden = true;
    $id('cohort-and-incentive-info').hidden = false;

    if (!advancedTiers) {
        $id('month').innerHTML =
            `${quarterStartDate.format(dateFormat)} → ${quarterEndDateAdjusted.format(dateFormat)}`;

        $id('same-tier-quarterly-hours').hidden = false;
        $id('calculate-bonus-for-single-tier-button').hidden = false;
    } else {
        for (const month of [1, 2, 3]) {
            $id(`month-${month}`).innerHTML = createStringForMonthInQuarter(month);
        }

        $id('multi-tier-quarterly-hours').hidden = false;
        $id('calculate-bonus-for-multi-tier-button').hidden = false;
    }
}

function createStringForMonthInQuarter(month) {
    const startDate = quarterStartDate.add(month - 1, 'month').format(dateFormat);
    const endDate = quarterEndDateAdjusted.subtract(3 - month, 'month').format(dateFormat);

    return `${startDate} → ${endDate}`;
}

function populateRates(idSuffix) {
    const tier = getCheckedRadioButton(`coach-tier${idSuffix}`).value;
    const prefix = '×';
    const suffix = 'USD';

    $id(`personal-hour-rate${idSuffix}`).innerHTML =
        `${prefix} ${rates[tier].base} ${suffix}`;

    for (const type of ['creator', 'career', 'parent', 'group']) {
        $id(`${type}-hour-rate${idSuffix}`).innerHTML =
            `${prefix} ${rates[tier].specialty} ${suffix}`;
    }
}

function getNumberInput(inputId) {
    const input = $id(inputId);
    const value = input.value;
    if (value === '') {
        return parseFloat(input.placeholder);
    } else {
        return parseFloat(value);
    }
}

function calculateBonusForSingleTier() {

    let errorMessages = [];
    errorMessages.push(validateRadioGroupChecked('coach-tier'));

    for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
        const id = `quarterly-${type}-hours`;
        const value = $id(id).value;
        errorMessages.push(
            validateNonNegativeNumber(id,
                `'${id}' must be a non-negative number... got '${value}'`));
    }

    errorMessages = errorMessages.filter(error => error != undefined);
    let errorMessage = errorMessages.join('; ');
    errorMessage = (errorMessage.length !== 0) ? errorMessage : undefined;

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const tier = getCheckedRadioButton('coach-tier').value;

    let multiplier = (medianHoursSelection !== 'Less than 13') ?
        incentives.medianHours[tier][medianHoursSelection] : 0;
    multiplier += psfRatingMet ? incentives.psfRating[tier] : 0;
    multiplier += highDemandSlotsMet ? incentives.highDemandSlots[tier] : 0;
    multiplier *= (cohort === '0-5') ? 1 : 0.5;
    multiplier /= 100;

    let income = 0;
    income += getNumberInput('quarterly-personal-hours') * rates[tier].base;
    for (const type of ['creator', 'career', 'parent', 'group']) {
        income += getNumberInput(`quarterly-${type}-hours`) * rates[tier].specialty;
    }

    const bonus = income * multiplier;

    $id('bonus-label').innerHTML = `Bonus for ${quarterYear} ${quarter}`;
    $id('bonus').innerHTML = `${bonus.toFixed(2)} USD`;

    toggleVisibility('bonus-results', true);
}

function calculateBonusForMultiTier() {
    let errorMessages = [];

    for (const month of [1, 2, 3]) {
        errorMessages.push(validateRadioGroupChecked(`coach-tier-${month}`));
        for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
            const id = `quarterly-${type}-hours-${month}`;
            const value = $id(id).value;
            errorMessages.push(
                validateNonNegativeNumber(id,
                    `'${id}' must be a non-negative number... got '${value}'`));
        }
    }

    errorMessages = errorMessages.filter(error => error != undefined);
    let errorMessage = errorMessages.join('; ');
    errorMessage = (errorMessage.length !== 0) ? errorMessage : undefined;

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    let bonus = 0;

    for (const month of [1, 2, 3]) {
        const tier = getCheckedRadioButton(`coach-tier-${month}`).value;

        let multiplier = (medianHoursSelection !== 'Less than 13') ?
            incentives.medianHours[tier][medianHoursSelection] : 0;
        multiplier += psfRatingMet ? incentives.psfRating[tier] : 0;
        multiplier += highDemandSlotsMet ? incentives.highDemandSlots[tier] : 0;
        multiplier *= (cohort === '0-5') ? 1 : 0.5;
        multiplier /= 100;

        let income = 0;
        income += getNumberInput(`quarterly-personal-hours-${month}`) * rates[tier].base;
        for (const type of ['creator', 'career', 'parent', 'group']) {
            income += getNumberInput(`quarterly-${type}-hours-${month}`) * rates[tier].specialty;
        }

        bonus += income * multiplier;
    }

    $id('bonus-label').innerHTML = `Bonus for ${quarterYear} ${quarter}`;
    $id('bonus').innerHTML = `${bonus.toFixed(2)} USD`;

    toggleVisibility('bonus-results', true);
}
=======
// jshint esversion: 7

let dateFormat;

let quarterYear;
let quarter;

let quarterStartDate;
let quarterEndDateAdjusted;
let cohort;
let medianHoursSelection;
let psfRatingMet;
let highDemandSlotsMet;

const incentives = {
    'psfRating': {
        'core': 2,
        'advanced': 3,
        'master': 4
    },
    'medianHours': {
        'core': {
            '13+': 2,
            '17+': 6,
            '20+': 12,
            '24+': 15
        },
        'advanced': {
            '13+': 3,
            '17+': 8,
            '20+': 15,
            '24+': 19
        },
        'master': {
            '13+': 4,
            '17+': 10,
            '20+': 18,
            '24+': 23
        }
    },
    'highDemandSlots': {
        'core': 2,
        'advanced': 2,
        'master': 2
    }
};

const rates = {
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

function prepareBonusCalculator() {
    resetBonusCalculator();
    autofillPreviousQuarter();
    dateFormat = getDateFormat();
    selectDefaultCohort();

    console.log('%cPrepared \'bonus-calculator\'', 'color: #88ff88');
}

function resetBonusCalculator() {
    toggleVisibility('bonus-results', false);

    $id('calculate-bonus-for-single-tier-button').hidden = true;
    $id('same-tier-quarterly-hours').hidden = true;

    $id('multi-tier-quarterly-hours').hidden = true;
    $id('calculate-bonus-for-multi-tier-button').hidden = true;

    $id('cohort-and-incentive-info').hidden = true;
    $id('cohort-advancement-and-incentive-inputs').hidden = true;

    $id('calculated-quarter-info').hidden = true;

    $id('year-of-quarter').value = '';
    $id('quarter-selection').value='';
    setInputSelectionColor('quarter-selection');

    uncheckRadioButton('cohort-selection');
    uncheckRadioButton('did-coach-advance-tiers');
    uncheckRadioButton('median-hours');
    $id('psf-rating').checked = false;
    $id('high-demand-slots').checked = false;

    for (const suffix of ['', '-1', '-2', '-3']) {
        uncheckRadioButton(`coach-tier${suffix}`);
        for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
            $id(`quarterly-${type}-hours${suffix}`).value = '';
        }
    }

    autofillPreviousQuarter();
    selectDefaultCohort();
    $id('quarter-inputs').hidden = false;
}

function autofillPreviousQuarter() {
    const now = dayjs().utc();
    const quarterYearInput = $id('year-of-quarter');
    const quarterInput = $id('quarter-selection');

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

    setInputSelectionColor('quarter-selection');
}

function selectDefaultCohort() {
    const storedCohort = getDefaultCohort();
    switch (storedCohort) {
        case null:
        case 'null':
            break;
        case '0-5':
            $id('cohort-0-to-5-radio-button').checked = true;
            break;
        case '6+':
            $id('cohort-6-plus-radio-button').checked = true;
            break;
        default:
            throw new Error(`Invalid cohort: '${storedCohort}'`);
    }
}

function selectDefaultTier() {
    if ($id('did-coach-advance-tiers').checked) {
        return;
    }

    const storedTier = getDefaultTier();
    switch (storedTier) {
        case null:
        case 'null':
            break;
        case 'core':
            for (const suffix of ['', '-1', '-2', '-3']) {
                $id(`coach-tier-core${suffix}`).checked = true;
                populateRates(suffix);
            }
            break;
        case 'advanced':
            for (const suffix of ['', '-1', '-2', '-3']) {
                $id(`coach-tier-advanced${suffix}`).checked = true;
                populateRates(suffix);
            }
            break;
        case 'master':
            for (const suffix of ['', '-1', '-2', '-3']) {
                $id(`coach-tier-master${suffix}`).checked = true;
                populateRates(suffix);
            }
            break;
        default:
            throw new Error(`Invalid Master tier: '${storedTier}'`);
    }
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

    quarterYear = $id('year-of-quarter').value;
    quarter = $id('quarter-selection').value;

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

    $id('quarter').innerHTML = `${quarterYear} ${quarter}`;
    $id('quarter-start-date').innerHTML = quarterStartDateStr;
    $id('quarter-end-date').innerHTML = quarterEndDateStr;
    $id('quarter-pay-date').innerHTML = quarterPayDateStr;

    $id('did-coach-advance-tiers-question').innerHTML = `Did you advance tiers during ${quarterYear} ${quarter}?`;

    $id('quarter-inputs').hidden = true;
    $id('calculated-quarter-info').hidden = false;
    $id('cohort-advancement-and-incentive-inputs').hidden = false;
}

function showQuarterlyHourInputs() {

    const errorMessage = validateSeveral(
        validateRadioGroupChecked('cohort-selection'),
        validateRadioGroupChecked('did-coach-advance-tiers'),
        validateRadioGroupChecked('median-hours'));

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    cohort = getCheckedRadioButton('cohort-selection').value;

    const advancedTiers = getCheckedRadioButton('did-coach-advance-tiers').value === 'yes';
    medianHoursSelection = getCheckedRadioButton('median-hours').value;
    psfRatingMet = $id('psf-rating').checked;
    highDemandSlotsMet = $id('high-demand-slots').checked;

    $id('cohort-and-incentive-info').innerHTML =
        `<span class='accented'>Cohort ${cohort}</span><br>
        <span class='accented'>${advancedTiers ? 'Did' : 'Didn\'t'} advance</span> tiers<br>
        <span class='accented'>${medianHoursSelection}</span> median coaching hours<br>
        <span class='accented'>${psfRatingMet ? 'Did' : 'Didn\'t'} meet</span> PSF rating requirement<br>
        <span class='accented'>${highDemandSlotsMet ? '4+' : 'Less than 4'}</span> high-demand slots worked`;

    $id('cohort-advancement-and-incentive-inputs').hidden = true;
    $id('cohort-and-incentive-info').hidden = false;

    if (!advancedTiers) {
        $id('month').innerHTML =
            `${quarterStartDate.format(dateFormat)} → ${quarterEndDateAdjusted.format(dateFormat)}`;

        $id('same-tier-quarterly-hours').hidden = false;
        $id('calculate-bonus-for-single-tier-button').hidden = false;
    } else {
        for (const month of [1, 2, 3]) {
            $id(`month-${month}`).innerHTML = createStringForMonthInQuarter(month);
        }

        $id('multi-tier-quarterly-hours').hidden = false;
        $id('calculate-bonus-for-multi-tier-button').hidden = false;
    }
}

function createStringForMonthInQuarter(month) {
    const startDate = quarterStartDate.add(month - 1, 'month').format(dateFormat);
    const endDate = quarterEndDateAdjusted.subtract(3 - month, 'month').format(dateFormat);

    return `${startDate} → ${endDate}`;
}

function populateRates(idSuffix) {
    const tier = getCheckedRadioButton(`coach-tier${idSuffix}`).value;
    const prefix = '×';
    const suffix = 'USD';

    $id(`personal-hour-rate${idSuffix}`).innerHTML =
        `${prefix} ${rates[tier].base} ${suffix}`;

    for (const type of ['creator', 'career', 'parent', 'group']) {
        $id(`${type}-hour-rate${idSuffix}`).innerHTML =
            `${prefix} ${rates[tier].specialty} ${suffix}`;
    }
}

function getNumberInput(inputId) {
    const input = $id(inputId);
    const value = input.value;
    if (value === '') {
        return parseFloat(input.placeholder);
    } else {
        return parseFloat(value);
    }
}

function calculateBonusForSingleTier() {

    let errorMessages = [];
    errorMessages.push(validateRadioGroupChecked('coach-tier'));

    for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
        const id = `quarterly-${type}-hours`;
        const value = $id(id).value;
        errorMessages.push(
            validateNonNegativeNumber(id,
                `'${id}' must be a non-negative number... got '${value}'`));
    }

    errorMessages = errorMessages.filter(error => error != undefined);
    let errorMessage = errorMessages.join('; ');
    errorMessage = (errorMessage.length !== 0) ? errorMessage : undefined;

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const tier = getCheckedRadioButton('coach-tier').value;

    let multiplier = (medianHoursSelection !== 'Less than 13') ?
        incentives.medianHours[tier][medianHoursSelection] : 0;
    multiplier += psfRatingMet ? incentives.psfRating[tier] : 0;
    multiplier += highDemandSlotsMet ? incentives.highDemandSlots[tier] : 0;
    multiplier *= (cohort === '0-5') ? 1 : 0.5;
    multiplier /= 100;

    let income = 0;
    income += getNumberInput('quarterly-personal-hours') * rates[tier].base;
    for (const type of ['creator', 'career', 'parent', 'group']) {
        income += getNumberInput(`quarterly-${type}-hours`) * rates[tier].specialty;
    }

    const bonus = income * multiplier;

    $id('bonus-label').innerHTML = `Bonus for ${quarterYear} ${quarter}`;
    $id('bonus').innerHTML = `${bonus.toFixed(2)} USD`;

    toggleVisibility('bonus-results', true);
}

function calculateBonusForMultiTier() {
    let errorMessages = [];

    for (const month of [1, 2, 3]) {
        errorMessages.push(validateRadioGroupChecked(`coach-tier-${month}`));
        for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
            const id = `quarterly-${type}-hours-${month}`;
            const value = $id(id).value;
            errorMessages.push(
                validateNonNegativeNumber(id,
                    `'${id}' must be a non-negative number... got '${value}'`));
        }
    }

    errorMessages = errorMessages.filter(error => error != undefined);
    let errorMessage = errorMessages.join('; ');
    errorMessage = (errorMessage.length !== 0) ? errorMessage : undefined;

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    let bonus = 0;

    for (const month of [1, 2, 3]) {
        const tier = getCheckedRadioButton(`coach-tier-${month}`).value;

        let multiplier = (medianHoursSelection !== 'Less than 13') ?
            incentives.medianHours[tier][medianHoursSelection] : 0;
        multiplier += psfRatingMet ? incentives.psfRating[tier] : 0;
        multiplier += highDemandSlotsMet ? incentives.highDemandSlots[tier] : 0;
        multiplier *= (cohort === '0-5') ? 1 : 0.5;
        multiplier /= 100;

        let income = 0;
        income += getNumberInput(`quarterly-personal-hours-${month}`) * rates[tier].base;
        for (const type of ['creator', 'career', 'parent', 'group']) {
            income += getNumberInput(`quarterly-${type}-hours-${month}`) * rates[tier].specialty;
        }

        bonus += income * multiplier;
    }

    $id('bonus-label').innerHTML = `Bonus for ${quarterYear} ${quarter}`;
    $id('bonus').innerHTML = `${bonus.toFixed(2)} USD`;

    toggleVisibility('bonus-results', true);
}
>>>>>>> 4a789041cc4bf8c8831c5515259e265ce84182bc
