// jshint esversion: 7

let endYear;
let endMonth;
let endDate;
let sixMonthStartDate;
let threeMonthStartDate;

function prepareAverageHoursCalculator() {
    bindKeyPressToFocus('billing-period-end-year', 'Enter', 'billing-period-end-month');
    bindKeyPressToButton('billing-period-end-month', 'Enter', 'calculate-date-ranges-button');
    bindKeyPressToFocus('6-month-worked-hours', 'Enter', '3-month-worked-hours');
    bindKeyPressToButton('3-month-worked-hours', 'Enter', 'calculate-average-hours-button');

    resetAverageWeeklyHoursCalculator();
    autofillCurrentOrRecentBillingPeriod();

    console.log('%cPrepared \'average-hours-calculator\'', 'color: #88ff88');
}

function autofillCurrentOrRecentBillingPeriod() {
    const now = dayjs().utc();
    $id('billing-period-end-year').value = now.year();
    $id('billing-period-end-month').value = now.month() + 1;
    setInputSelectionColor('billing-period-end-month');
}

function calculateStartDates() {
    const errorMessage = validateSeveral(
        validateYear('billing-period-end-year'),
        validateMonth('billing-period-end-month'));
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    dateFormat = 'YYYY MMM Do';

    endYear = parseInt($id('billing-period-end-year').value);
    endMonth = parseInt($id('billing-period-end-month').value);

    endDate = dayjs(new Date(endYear, endMonth - 1, 26)).utc();
    $id('billing-period-end-date').innerHTML = endDate.subtract(1, 'day').format(dateFormat);
    lockEndDate(true);

    sixMonthStartDate = endDate.subtract(6, 'month');
    threeMonthStartDate = endDate.subtract(3, 'month');

    $id('6-month-start-date').innerHTML = sixMonthStartDate.format(dateFormat);
    $id('3-month-start-date').innerHTML = threeMonthStartDate.format(dateFormat);

    $id('average-hours-results').hidden = true;
    $id('worked-hours-inputs').hidden = false;

    $id('6-month-worked-hours').focus();
}

function lockEndDate(isLocked) {
    $id('editable-billing-period-end-date').hidden = isLocked;
    $id('calculate-date-ranges-button').hidden = isLocked;

    $id('billing-period-end-date').hidden = !isLocked;
    $id('billing-period-date-reset-button').hidden = !isLocked;
}

function toggleAverageHoursBreakdown() {
    toggleVisibility('average-weekly-hours-breakdown',
                     undefined,
                     'toggle-average-hours-breakdown-button',
                     'Show breakdown',
                     'Hide breakdown');
}

function calculateAverageWeeklyHours() {

    const sixMonthWorkedHoursElement = $id('6-month-worked-hours');
    const threeMonthWorkedHoursElement = $id('3-month-worked-hours');

    const errorMessage = validateSeveral(
        validateNonNegativeNumber('6-month-worked-hours',
            `Hours for 6-month period must be a non-negative number... got '${sixMonthWorkedHoursElement.value}'`),
        validateNonNegativeNumber('3-month-worked-hours',
            `Hours for 3-month period must be a non-negative number... got '${threeMonthWorkedHoursElement.value}'`));

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
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

    $id('average-weekly-hours').innerHTML = roundDecimal(averageWeeklyHours, 3);

    let sixMonthHoursNeeded = Math.ceil(20 * sixMonthWeeks - sixMonthWorkedHours);
    sixMonthHoursNeeded = Math.max(sixMonthHoursNeeded, 0);
    let threeMonthHoursNeeded = Math.ceil(20 * threeMonthWeeks - threeMonthWorkedHours);
    threeMonthHoursNeeded = Math.max(threeMonthHoursNeeded, 0);
    const hoursNeeded = Math.min(sixMonthHoursNeeded, threeMonthHoursNeeded);

    $id('hours-needed').innerHTML = hoursNeeded;

    const endDateStr = endDate.subtract(1, 'day').format(dateFormat);

    const sixMonthStartDateStr = sixMonthStartDate.format(dateFormat);
    const sixMonthWeeksStr = roundDecimal(sixMonthWeeks, 3);
    const sixMonthAverageHoursStr = roundDecimal(sixMonthAverageHours, 3);
    const sixMonthAverageOperator = (sixMonthAverageHours == sixMonthAverageHoursStr) ? '=' : '≈';

    const threeMonthStartDateStr = threeMonthStartDate.format(dateFormat);
    const threeMonthWeeksStr = roundDecimal(threeMonthWeeks, 3);
    const threeMonthAverageHoursStr = roundDecimal(threeMonthAverageHours, 3);
    const threeMonthAverageOperator = (threeMonthAverageHours == threeMonthAverageHoursStr) ? '=' : '≈';

    const sixMonthsAverageIsMax = sixMonthAverageHours > threeMonthAverageHours;
    const sixMonthsHoursNeededIsMin = sixMonthHoursNeeded < threeMonthHoursNeeded;

    const highlightedAttribute = " class='accented'";

    const sixMonthAverageAttribute = sixMonthsAverageIsMax ? highlightedAttribute : '';
    const threeMonthAverageAttribute = sixMonthsAverageIsMax ? '' : highlightedAttribute;

    const sixMonthHoursNeededAttribute = sixMonthsHoursNeededIsMin ? highlightedAttribute : '';
    const threeMonthHoursNeededAttribute = sixMonthsHoursNeededIsMin ? '' : highlightedAttribute;

    const space = '&#0020;';
    $id('average-weekly-hours-breakdown').innerHTML = `<br>

        <strong>Formulae</strong><br><br>

        Calculate averages for 6 and 3-month periods. Take the greater of the two.<br><br>

        <div class='inline-block'>
          <math display='block'>
            <mi>average weekly hours</mi>
            <mo>=</mo>
            <mfrac>
              <mrow>
                <mi>total hours</mi>
              </mrow>
              <mrow>
                <mi>total days</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mfrac>
              <mrow>
                <mn>7</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
              <mrow>
                <mi>week</mi>
              </mrow>
            </mfrac>
          </math>
        </div><br><br>

        <div class='inline-block'>
          <math display='block'>
            <mi>hours needed</mi>
            <mo>=</mo>
            <mfrac>
              <mrow>
                <mn>20</mn>
                <mi>${space}</mi>
                <mi>hours</mi>
              </mrow>
              <mrow>
                <mi>week</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mfrac>
              <mrow>
                <mn>1</mn>
                <mi>${space}</mi>
                <mi>week</mi>
              </mrow>
              <mrow>
                <mn>7</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mi>total days</mi>
          </math>
        </div><br><br>

        <hr class='solid'><br>

        <strong>6-month calculations</strong><br><br>

        <div class='inline-block'>
          <math display='block'>
            <mi>${sixMonthStartDateStr}</mi>
            <mo>→</mo>
            <mi>${endDateStr}</mi>
            <mo>=</mo>
            <mn>${sixMonthDays}</mn>
            <mi>${space}</mi>
            <mi>days</mi>
          </math>
        </div><br><br>

        <div class='inline-block'>
          <math display='block'>
            <span${sixMonthAverageAttribute}>
            <mn>${sixMonthAverageHoursStr}</mn>
            <mi>${space}</mi>
            <mi>average weekly hours</mi>
            </span>
            <mo>${sixMonthAverageOperator}</mo>
            <mfrac>
              <mrow>
                <mn>${sixMonthWorkedHours}</mn>
                <mi>${space}</mi>
                <mi>hours</mi>
              </mrow>
              <mrow>
                <mn>${sixMonthDays}</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mfrac>
              <mrow>
                <mn>7</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
              <mrow>
                <mi>week</mi>
              </mrow>
            </mfrac>
          </math>
        </div><br><br>

        <div class='inline-block'>
          <math display='block'>
            <span${sixMonthHoursNeededAttribute}>
            <mn>${sixMonthHoursNeeded}</mn>
            <mi>${space}</mi>
            <mi>hours needed</mi>
            </span>
            <mi>${space}</mi>
            <mi>(rounded up)</mi>
            <mo>=</mo>
            <mfrac>
              <mrow>
                <mn>20</mn>
                <mi>${space}</mi>
                <mi>hours</mi>
              </mrow>
              <mrow>
                <mi>week</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mfrac>
              <mrow>
                <mn>1</mn>
                <mi>${space}</mi>
                <mi>week</mi>
              </mrow>
              <mrow>
                <mn>7</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mn>${sixMonthDays}</mn>
            <mi>${space}</mi>
            <mi>days</mi>
          </math>
        </div><br><br>

        <hr class='solid'><br>

        <strong>3-month calculations</strong><br><br>

        <div class='inline-block'>
          <math display='block'>
            <mi>${threeMonthStartDateStr}</mi>
            <mo>→</mo>
            <mi>${endDateStr}</mi>
            <mo>=</mo>
            <mn>${threeMonthDays}</mn>
            <mi>${space}</mi>
            <mi>days</mi>
          </math>
        </div><br><br>

        <div class='inline-block'>
          <math display='block'>
            <span${threeMonthAverageAttribute}>
            <mn>${threeMonthAverageHoursStr}</mn>
            <mi>${space}</mi>
            <mi>average weekly hours</mi>
            </span>
            <mo>${threeMonthAverageOperator}</mo>
            <mfrac>
              <mrow>
                <mn>${threeMonthWorkedHours}</mn>
                <mi>${space}</mi>
                <mi>hours</mi>
              </mrow>
              <mrow>
                <mn>${threeMonthDays}</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mfrac>
              <mrow>
                <mn>7</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
              <mrow>
                <mi>week</mi>
              </mrow>
            </mfrac>
            <mo>${threeMonthAverageOperator}</mo>
            <mn>${threeMonthAverageHoursStr}</mn>
          </math>
        </div><br><br>

        <div class='inline-block'>
          <math display='block'>
            <span${threeMonthHoursNeededAttribute}>
            <mn>${threeMonthHoursNeeded}</mn>
            <mi>${space}</mi>
            <mi>hours needed</mi>
            </span>
            <mi>${space}</mi>
            <mi>(rounded up)</mi>
            <mo>=</mo>
            <mfrac>
              <mrow>
                <mn>20</mn>
                <mi>${space}</mi>
                <mi>hours</mi>
              </mrow>
              <mrow>
                <mi>week</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mfrac>
              <mrow>
                <mn>1</mn>
                <mi>${space}</mi>
                <mi>week</mi>
              </mrow>
              <mrow>
                <mn>7</mn>
                <mi>${space}</mi>
                <mi>days</mi>
              </mrow>
            </mfrac>
            <mo>×</mo>
            <mn>${threeMonthDays}</mn>
            <mi>${space}</mi>
            <mi>days</mi>
          </math>
        </div>`;

    $id('average-hours-results').hidden = false;
}

function resetAverageWeeklyHoursCalculator() {
    $id('worked-hours-inputs').hidden = true;
    $id('average-hours-results').hidden = true;

    $id('billing-period-end-year').value = '';
    $id('billing-period-end-year').classList.remove('error');

    $id('billing-period-end-month').value = '';
    $id('billing-period-end-month').classList.remove('error');

    $id('6-month-worked-hours').value = '';
    $id('3-month-worked-hours').value = '';

    autofillCurrentOrRecentBillingPeriod();
    lockEndDate(false);
}
