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

const medianIncentives = {
    'core': {
        '13+': 2,
        '17+': 4,
        '20+': 6,
        '24+': 3
    },
    'advanced': {
        '13+': 3,
        '17+': 5,
        '20+': 7,
        '24+': 4
    },
    'master': {
        '13+': 4,
        '17+': 6,
        '20+': 8,
        '24+': 5
    }
}

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

function prepareIncentivesCalculator() {
    resetIncentivesCalculator();
    autofillPreviousQuarter('year-of-quarter', 'quarter-selection');
    mapCohortSelection();

    for (const selectMenuId of ['cohort', 'median-hours']) {
        setMenuSelectionColor(selectMenuId);
    }

    setMenuSelectionColor('coach-tier');

    setUpInputSelectionBehavior();

    console.log('%cPrepared \'incentives-calculator\'', 'color: #88ff88');
}

function resetIncentivesCalculator() {
    toggleIncentiveBreakdown(false);
    $id('incentive-results').hidden = true;

    $id('calculate-incentive-for-single-tier-button').hidden = true;
    $id('same-tier-quarterly-hours').hidden = true;

    $id('cohort-and-incentive-info').hidden = true;
    $id('preliminary-incentive-inputs').hidden = true;

    $id('calculated-quarter-info').hidden = true;

    $id('year-of-quarter').value = '';
    $id('quarter-selection').value = '';

    $id('median-hours').value = '--';
    $id('psf-rating').checked = false;
    $id('high-demand-slots').checked = false;

    $id('coach-tier').value = '--';
    setMenuSelectionColor('coach-tier');
    populateRates('');
    for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
        $id(`quarterly-${type}-hours`).value = '';
    }

    autofillPreviousQuarter('year-of-quarter', 'quarter-selection');
    mapCohortSelection();
    for (const selectMenuId of ['cohort', 'median-hours']) {
        setMenuSelectionColor(selectMenuId);
    }

    $id('quarter-inputs').hidden = false;
}

function selectDefaultTier() {
    const storedTier = storage.get('tier');
    $id('coach-tier').value = storedTier ?? '--';
}

function setUpInputSelectionBehavior() {
    const selectMenuBehaviors = {};

    for (const selectMenuId of ['cohort', 'median-hours']) {
        selectMenuBehaviors[selectMenuId] = `setMenuSelectionColor('${selectMenuId}')`;
    }

    selectMenuBehaviors['coach-tier'] = `setMenuSelectionColor('coach-tier');
                                         populateRates('');`

    for (const [selectMenuId, behavior] of Object.entries(selectMenuBehaviors)) {
        $id(selectMenuId).setAttribute('onchange', behavior);
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

    const quarterStartDateStr = quarterStartDate.format(format.date);
    quarterEndDateAdjusted = quarterEndDate.subtract(1, 'day');
    const quarterEndDateStr = quarterEndDateAdjusted.format(format.date);
    const quarterPayDateStr = quarterEndDateAdjusted.add(2, 'month').format(format.date);

    $id('quarter').innerHTML = `${quarterYear} ${quarter}`;
    $id('quarter-start-date').innerHTML = quarterStartDateStr;
    $id('quarter-end-date').innerHTML = quarterEndDateStr;
    $id('quarter-pay-date').innerHTML = quarterPayDateStr;

    $id('quarter-inputs').hidden = true;
    $id('calculated-quarter-info').hidden = false;
    $id('preliminary-incentive-inputs').hidden = false;
}

function showQuarterlyHourInputs() {

    const errorMessage = validateSeveral(
        validateSelectMenuSelected('cohort'),
        validateSelectMenuSelected('median-hours'));

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    cohort = $id('cohort').value;
    medianHoursSelection = $id('median-hours').value;
    psfRatingMet = $id('psf-rating').checked;
    highDemandSlotsMet = $id('high-demand-slots').checked;

    $id('cohort-and-incentive-info').innerHTML = `
        <span class='accented'>Cohort ${cohort}</span><br>
        <span class='accented'>${medianHoursSelection}</span> median coaching hours<br>
        <span class='accented'>${psfRatingMet ? 'Did' : 'Didn\'t'} meet</span> PSF rating requirement<br>
        <span class='accented'>${highDemandSlotsMet ? '4+' : 'Less than 4'}</span> high-demand slots worked`;

    $id('preliminary-incentive-inputs').hidden = true;
    $id('cohort-and-incentive-info').hidden = false;

    if (medianHoursSelection === 'Less than 13' && !psfRatingMet && !highDemandSlotsMet) {
        const bonus = 0;
        $id('incentive-label').innerHTML = `Bonus for ${quarterYear} ${quarter}`;
        $id('incentive').innerHTML = `${bonus.toFixed(2)} USD`;
        toggleVisibility('incentive-results', true);
        return;
    }

    selectDefaultTier();
    setMenuSelectionColor('coach-tier');
    populateRates('');

    $id('month').innerHTML = `

    <tr>
      <td class='annotation text-align-right'>from</td>
      <td>
        <span class='accented'>${quarterStartDate.format(format.date)}</span>
        <span class='annotation'>(00:00 UTC)</span>
      </td>
    </tr>
    <tr class='padding-below'>
      <td class='annotation text-align-right'>to</td>
      <td>
        <span class='accented'>${quarterEndDateAdjusted.format(format.date)}</span>
        <span class='annotation'>(23:59 UTC)</span>
      </td>
    </tr>

    `;

    $id('same-tier-quarterly-hours').hidden = false;
    $id('calculate-incentive-for-single-tier-button').hidden = false;

}

function getDatesForMonthInQuarter(month) {
    const startDateString = quarterStartDate.add(month - 1, 'month').format(format.date);
    const endDateString = quarterEndDateAdjusted.subtract(3 - month, 'month').format(format.date);

    return [startDateString, endDateString];
}

function populateRates(idSuffix) {
    const tier = $id(`coach-tier${idSuffix}`).value;
    const prefix = '×';
    const suffix = 'USD';

    $id(`personal-hour-rate${idSuffix}`).innerHTML = (tier === '--') ?
        '' : `${prefix} ${rates[tier].base} ${suffix}`;

    for (const type of ['creator', 'career', 'parent', 'group']) {
        $id(`${type}-hour-rate${idSuffix}`).innerHTML = (tier === '--') ?
            '' : `${prefix} ${rates[tier].specialty} ${suffix}`;
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

function calculateIncentiveForSingleTier() {
    let errorMessages = [];
    errorMessages.push(validateSelectMenuSelected('coach-tier'));

    for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
        const id = `quarterly-${type}-hours`;
        const value = $id(id).value;
        errorMessages.push(
            validateNonNegativeNumber(id,
                `'${id}' must be a non-negative number... got '${value}'`));
    }

    const errorMessage = distillErrorMessages(errorMessages);
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const tier = $id('coach-tier').value;

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

    $id('incentive-label').innerHTML = `Bonus for ${quarterYear} ${quarter}`;
    $id('incentive').innerHTML = `${bonus.toFixed(2)} USD`;
    $id('incentive-breakdown').innerHTML =
        createIncentiveBreakdownForSingleTier(cohort,
                                              tier,
                                              medianHoursSelection,
                                              psfRatingMet,
                                              highDemandSlotsMet);

    toggleVisibility('incentive-results', true);
}

function toggleIncentiveBreakdown(shown) {
    toggleVisibility('incentive-breakdown',
                     shown,
                     'toggle-incentive-breakdown-button',
                     'Show breakdown',
                     'Hide breakdown');
    renderMathJax();
}

function createIncentiveBreakdownForSingleTier(cohort,
                                               tier,
                                               medianHours,
                                               psfRatingMet,
                                               highDemandSlotsMet,
                                               suffix = '') {

    const suffixLabel = (suffix === '') ? '' : ` (month ${suffix[1]})`;

    let multiplier = (medianHoursSelection !== 'Less than 13') ?
        incentives.medianHours[tier][medianHoursSelection] : 0;
    multiplier += psfRatingMet ? incentives.psfRating[tier] : 0;
    multiplier += highDemandSlotsMet ? incentives.highDemandSlots[tier] : 0;
    multiplier *= (cohort === '0-5') ? 1 : 0.5;
    multiplier /= 100;

    let incentiveFor13MedianHours = '';
    let incentiveFor17MedianHours = '';
    let incentiveFor20MedianHours = '';
    let incentiveFor24MedianHours = '';
    let incentiveForPsfRating = '';
    let incentiveForHighDemandSlots = '';
    let incentiveTotal = 0;

    const medianIncentivesForTier = medianIncentives[tier];
    let incentiveRate;

    switch (medianHours) {
        case '24+':
            incentiveRate = medianIncentivesForTier['24+'] * ((cohort === '0-5') ? 1 : 0.5);
            incentiveTotal += incentiveRate;
            incentiveFor24MedianHours =
                `<div class='math'>$$+${incentiveRate}\\%\\text{ for 24+ median hours}$$</div>`;
        case '20+':
            incentiveRate = medianIncentivesForTier['20+'] * ((cohort === '0-5') ? 1 : 0.5);
            incentiveTotal += incentiveRate;
            incentiveFor20MedianHours =
                `<div class='math'>$$+${incentiveRate}\\%\\text{ for 20+ median hours}$$</div>`;
        case '17+':
            incentiveRate = medianIncentivesForTier['17+'] * ((cohort === '0-5') ? 1 : 0.5);
            incentiveTotal += incentiveRate;
            incentiveFor17MedianHours =
                `<div class='math'>$$+${incentiveRate}\\%\\text{ for 17+ median hours}$$</div>`;
        case '13+':
            incentiveRate = medianIncentivesForTier['13+'] * ((cohort === '0-5') ? 1 : 0.5);
            incentiveTotal += incentiveRate;
            incentiveFor13MedianHours =
                `<div class='math'>$$+${incentiveRate}\\%\\text{ for 13+ median hours}$$</div>`;
            break;
        default:
            throw new Error(`Unexpected median hours selection: '${medianHours}'`);
    }

    if (psfRatingMet) {
        incentiveRate = incentives.psfRating[tier] * ((cohort === '0-5') ? 1 : 0.5);
        incentiveTotal += incentiveRate;
        incentiveForPsfRating =
            `<div class='math'>$$+${incentiveRate}\\%\\text{ for meeting PSF rating requirement}$$</div>`;
    }

    if (highDemandSlotsMet) {
        incentiveRate = incentives.highDemandSlots[tier] * ((cohort === '0-5') ? 1 : 0.5);
        incentiveTotal += incentiveRate;
        incentiveForHighDemandSlots =
            `<div class='math'>$$+${incentiveRate}\\%\\text{ for 4+ high-demand slots worked}$$</div>`;
    }

    const incentiveTotalString = `
        <div class='math'>
          $$
            \\text{total incentive}
            =
            \\class
              {accented}
              {${incentiveTotal}\\%}
          $$
        </div>`;

    let hoursBreakdown = '';
    let hoursIncome = 0;
    for (const type of ['personal', 'creator', 'career', 'parent', 'group']) {
        const typeHours = getNumberInput(`quarterly-${type}-hours${suffix}`);
        if (typeHours === 0) {
            continue;
        }
        const typeRate = rates[tier][type !== 'personal' ? 'specialty' : 'base'];
        const typeIncome = typeHours * typeRate;
        hoursIncome += typeIncome;

        hoursBreakdown += `

        <div class='math'>
          $$
            ${typeHours}\\text{ ${type} hours}
            \\times
            ${typeRate}\\text{ USD}
            =
            ${typeIncome.toFixed(2)}\\text{ USD}
          $$
        </div>

        `;
    }

    hoursBreakdown += `

    <div class='math'>
      $$
        \\text{total base income}
        =
        \\class
          {accented}
          {${hoursIncome.toFixed(2)}\\text{ USD}}
      $$
    </div>

    `;

    const incentiveMultiplication = `

    <div class='math'>
      $$
        ${hoursIncome}\\text{ USD}
        \\times
        ${incentiveTotal}\\%
        =
        \\class
          {accented}
          {${(hoursIncome * incentiveTotal / 100).toFixed(2)}\\text{ USD}}
      $$
    </div>

    `;

    return `

    <hr><br>

    <strong>Incentive rate${suffixLabel}</strong>

    ${incentiveFor13MedianHours}
    ${incentiveFor17MedianHours}
    ${incentiveFor20MedianHours}
    ${incentiveFor24MedianHours}
    ${incentiveForPsfRating}
    ${incentiveForHighDemandSlots}

    ${incentiveTotalString}

    <hr><br>

    <strong>Hours worked${suffixLabel}</strong>

    ${hoursBreakdown}

    <hr><br>

    <strong>Incentive total${suffixLabel}</strong>

    ${incentiveMultiplication}

    `;
}
