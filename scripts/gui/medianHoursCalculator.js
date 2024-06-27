function prepareMedianHoursCalculator() {
    autofillPreviousQuarter('year-of-quarter', 'quarter-selection');

    console.log('%cPrepared \'median-hours-calculator\'', 'color: #88ff88');
}

function resetMedianCalculator() {
    autofillPreviousQuarter('year-of-quarter', 'quarter-selection');

    $id('median-results').hidden = true;
    $id('calculate-median-button').hidden = true;
    $id('date-interval-section').hidden = true;
    $id('calculated-quarter-info').hidden = true;

    $id('quarter-inputs').hidden = false;
}

function calculateCalendarWeekIntervals() {
    const quarterYear = parseInt($id('year-of-quarter').value);
    const quarter = $id('quarter-selection').value;

    const quarterStartYear = (quarter === 'Q1') ? quarterYear - 1 : quarterYear;
    const quarterEndYear = quarterYear;

    let quarterStartMonth;
    let quarterEndMonth;
    switch (quarter) {
        case 'Q1':
            quarterStartMonth = 12;
            quarterEndMonth = 3;
            break;
        case 'Q2':
            quarterStartMonth = 3;
            quarterEndMonth = 6;
            break;
        case 'Q3':
            quarterStartMonth = 6;
            quarterEndMonth = 9;
            break;
        case 'Q4':
            quarterStartMonth = 9;
            quarterEndMonth = 12;
            break;
        default:
            throw new Error(`Unexpected quarter: '${quarter}'`);
    }

    const quarterStartDate = dayjs(new Date(quarterStartYear, quarterStartMonth - 1, 26));
    const quarterEndDate = dayjs(new Date(quarterEndYear, quarterEndMonth - 1, 26));

    const quarterStartDateString = quarterStartDate.format(format.date);
    const quarterEndDateAdjusted = quarterEndDate.subtract(1, 'minute');
    const quarterEndDateString = quarterEndDateAdjusted.format(format.date);
    const quarterPayDateString = quarterEndDateAdjusted.add(2, 'month').format(format.date);

    $id('quarter').innerHTML = `${quarterYear} ${quarter}`;
    $id('quarter-start-date').innerHTML = quarterStartDateString;
    $id('quarter-end-date').innerHTML = quarterEndDateString;
    $id('quarter-pay-date').innerHTML = quarterPayDateString;

    let tableContentsString = '';
    let startOfWeek = quarterStartDate.startOf('isoWeek');
    let intervalCount = 0;

    while (startOfWeek.isBefore(quarterEndDate)) {
        intervalCount++;
        const intervalId = `interval-${intervalCount}`;

        const isFirstInterval = intervalCount === 1;
        const isLastInterval = !startOfWeek.add(7, 'day').isBefore(quarterEndDate);

        const startDateString = (isFirstInterval ? quarterStartDate : startOfWeek)
                                .format(format.date);
        startOfWeek = startOfWeek.add(7, 'day');
        const endDateString = (isLastInterval ?
                                  quarterEndDateAdjusted :
                                  startOfWeek.subtract(1, 'day')
                              ).format(format.date);

        tableContentsString += `
        <tr>
          <th for=${intervalId} colspan='2'>Week ${intervalCount} hours
        </tr>
        <tr>
          <td class='annotation text-align-right'>from</td>
          <td>
            <span class='accented'>${startDateString}</span>
            <span class='annotation'>(00:00 UTC)</span>
          </td>
        </tr>
        <tr>
          <td class='annotation text-align-right'>to</td>
          <td>
            <span class='accented'>${endDateString}</span>
            <span class='annotation'>(23:59 UTC)</span>
          </td>
        </tr>
        <tr class='padding-below'>
          <td colspan='2'>
            <input id=${intervalId}
                   type='text'
                   class='four-numbers text-align-right'
                   placeholder='0'>
          </td>
        </tr>
        `;

    }

    $id('date-intervals').innerHTML = tableContentsString;

    $id('quarter-inputs').hidden = true;

    $id('calculated-quarter-info').hidden = false;
    $id('date-interval-section').hidden = false;
    $id('calculate-median-button').hidden = false;
}

function calculateMedian() {

    const unsortedIntervalData = [];
    const errorData = [];
    for (const input of $$tag('input')) {
        if (input.id.includes('interval-')) {
            unsortedIntervalData.push(
                (input.value === '') ? parseInt(input.placeholder) : parseInt(input.value)
            );
            errorData.push(validateNonNegativeNumber(input.id));
        }
    }

    const errorMessage = validateSeveral(errorData);
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const intervalDataCopy = unsortedIntervalData.concat([]);
    const sortedIntervalData = intervalDataCopy.sort((a, b) => a - b);

    let median;
    const intervalCount = sortedIntervalData.length;
    const bisected = (intervalCount % 2 === 0);
    let middleIndex;
    if (bisected) {
        const rightOfMiddleIndex = Math.floor(intervalCount / 2);
        const leftOfMiddleIndex = rightOfMiddleIndex - 1;
        middleIndex = [leftOfMiddleIndex, rightOfMiddleIndex];
        median = (sortedIntervalData[leftOfMiddleIndex]
                  + sortedIntervalData[rightOfMiddleIndex]) / 2;
    } else {
        middleIndex = Math.floor(intervalCount / 2);
        median = sortedIntervalData[middleIndex];
    }

    $id('median').innerHTML = median;
    $id('median-breakdown').innerHTML = getMedianBreakdown(
        unsortedIntervalData, sortedIntervalData, bisected, middleIndex, median);

    $id('median-results').hidden = false;
    renderMathJax();
}

function getMedianBreakdown(unsortedIntervalData, sortedIntervalData,
                            bisected, middleIndex, median) {

    const unsortedDataString = `\\{${unsortedIntervalData.join(', ')}\\}`;
    const sortedDataString = `\\{${sortedIntervalData.join(', ')}\\}`;

    const leftSideDataString = `
        ${sortedIntervalData
            .slice(0, bisected ? middleIndex[0] : middleIndex)
            .join(', ')}`;

    const middleData = bisected ?
        [sortedIntervalData[middleIndex[0]], sortedIntervalData[middleIndex[1]]] :
        sortedIntervalData[middleIndex];

    const middleDataString = bisected ?
        `
        \\class
          {accented}
          {${middleData[0]}}
        , 
        \\class
          {accented}
          {${middleData[1]}}` :
        `
        \\class
          {accented}
          {${middleData}}
        `;

    const rightSideDataString = `
        ${sortedIntervalData
            .slice(bisected ? middleIndex[1] + 1 : middleIndex + 1, sortedIntervalData.length)
            .join(', ')}`;

    const highlightedDataString = `
        \\{${leftSideDataString}, ${middleDataString}, ${rightSideDataString}\\}`;

    const averageCalculation = bisected ? `
        =
        \\frac
          {${middleData[0]}\\text{ hours} + ${middleData[1]}\\text{ hours}}
          {2}
        ` : '';

    return `

    <div class='math'>
      $$
        \\text{hours}
        =
        ${unsortedDataString}
      $$
    </div>

    <div class='math'>
      $$
        \\text{sorted hours}
        =
        ${highlightedDataString}
      $$
    </div>

    <div class='math'>
      $$
        \\text{median}
        ${averageCalculation}
        =
        \\class
          {accented}
          {${median}\\text{ hours}}
      $$
    </div>

    `;
}

function toggleMedianBreakdown() {
    toggleVisibility('median-breakdown',
                     undefined,
                     'toggle-median-breakdown-button',
                     'Show breakdown',
                     'Hide breakdown');
}
