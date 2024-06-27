function prepareTimeZoneComparison() {
    configureTimeZoneInput('coach-time-zone', 'default');
    configureTimeZoneInput('client-time-zone');
    anchor = 'coach-time-zone';
    setAnchor(`${anchor}-anchor`);

    setMenuSelectionColor('session-day');
    setInputTextColor('session-time');
    setUpInputBehaviorForComparison();

    console.log('%cPrepared \'time-zone-comparison\'', 'color: #88ff88');
}

function setUpInputBehaviorForComparison() {
    $id('session-day').setAttribute('onchange', `setMenuSelectionColor('session-day')`);
    $id('session-time').setAttribute('onchange', `setInputTextColor('session-time')`);
}

let anchor;
function setAnchor(anchorButtonId) {
    $id(`${anchor}-anchor`).classList.remove('selected');
    anchor = undefined;

    if (anchorButtonId === 'coach-time-zone-anchor') {
        anchor = 'coach-time-zone';
        $id('anchor-label').innerHTML = 'coach';

    } else if (anchorButtonId === 'client-time-zone-anchor') {
        anchor = 'client-time-zone';
        $id('anchor-label').innerHTML = 'client';

    } else {
        throw new Error(`Unrecognized anchor button ID: '${anchorButtonId}'`);
    }

    $id(anchorButtonId).classList.add('selected');
}

function getTimeZoneComparison(timeFormat) {
    const errorMessage = validateSeveral(
        validateTimeZone('coach-time-zone'),
        validateSelectMenuSelected('session-day'),
        validateTime('session-time'),
        validateTimeZone('client-time-zone'));

    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const now = dayjs();
    const coachTimeZoneIdentifier = getTimeZoneData('coach-time-zone', +now).identifier;
    const clientTimeZoneIdentifier = getTimeZoneData('client-time-zone', +now).identifier;
    const anchorTimeZoneIdentifier = getTimeZoneData(anchor, +now).identifier;

    if (!coachTimeZoneIdentifier.includes('/') ||
        coachTimeZoneIdentifier.toLowerCase().includes('etc')) {
        $id('coach-dst-warning').hidden = false;
    } else {
        $id('coach-dst-warning').hidden = true;
    }

    if (!clientTimeZoneIdentifier.includes('/') ||
        clientTimeZoneIdentifier.toLowerCase().includes('etc')) {
        $id('client-dst-warning').hidden = false;
    } else {
        $id('client-dst-warning').hidden = true;
    }

    const day = $id('session-day').value;
    const time = $id('session-time').value;
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);

    const currentDatetime = now.tz(anchorTimeZoneIdentifier);
    const currentWeekSessionDatetime = now.tz(anchorTimeZoneIdentifier)
                                          .day(day)
                                          .hour(hour)
                                          .minute(minute);

    const currentSessionPastAdjustment =
        (currentWeekSessionDatetime < currentDatetime) ? 1 : 0;

    if (timeFormat == undefined) {
        timeFormat = format.time;
    }

    let tableData = '';
    let coachLastSessionTime;
    let clientLastSessionTime;
    let coachAttribute;
    let clientAttribute;
    const sessionSpan = 10;

    for (let weekOffset of getNumberRange(-sessionSpan, 2 * sessionSpan + 1)) {
        weekOffset += currentSessionPastAdjustment;
        const offsetFromNow = now.add(weekOffset, 'week').tz(anchorTimeZoneIdentifier);
        const offsetAnchorDatetime = offsetFromNow.day(day).hour(hour).minute(minute);

        const coachTimeZoneData = getTimeZoneData('coach-time-zone', +offsetAnchorDatetime);
        const clientTimeZoneData = getTimeZoneData('client-time-zone', +offsetAnchorDatetime);

        let coachSessionDatetime;
        let clientSessionDatetime;

        if (anchor === 'coach-time-zone') {
            coachSessionDatetime = offsetAnchorDatetime;
            clientSessionDatetime = offsetAnchorDatetime.tz(clientTimeZoneIdentifier);

            $id('client-label').classList.remove('accented');
            $id('coach-label').classList.add('accented');
            $id('client-label-anchor').hidden = true;
            $id('coach-label-anchor').hidden = false;

        } else if (anchor === 'client-time-zone') {
            clientSessionDatetime = offsetAnchorDatetime;
            coachSessionDatetime = offsetAnchorDatetime.tz(coachTimeZoneIdentifier);

            $id('coach-label').classList.remove('accented');
            $id('client-label').classList.add('accented');
            $id('coach-label-anchor').hidden = true;
            $id('client-label-anchor').hidden = false;

        } else {
            throw new Error(`Unrecognized anchor: '${anchor}'`);
        }

        const coachSessionTime = coachSessionDatetime.format('ddd HH:mm');
        const clientSessionTime = clientSessionDatetime.format('ddd HH:mm');

        if (coachLastSessionTime != undefined && coachLastSessionTime != coachSessionTime) {
            coachAttribute = " class='warning'";
        } else {
            coachAttribute = '';
        }

        if (clientLastSessionTime != undefined && clientLastSessionTime != clientSessionTime) {
            clientAttribute = " class='warning'";
        } else {
            clientAttribute = '';
        }

        coachLastSessionTime = coachSessionTime;
        clientLastSessionTime = clientSessionTime;

        const rowAttribute = (weekOffset === currentSessionPastAdjustment) ?
            " class='highlighted-row'" : '';

        let offset;
        if (weekOffset < currentSessionPastAdjustment) {
            offset = `${weekOffset - currentSessionPastAdjustment} wk`;
        } else if (weekOffset === currentSessionPastAdjustment) {
            offset = 'Next';
        } else if (weekOffset > currentSessionPastAdjustment) {
            offset = `+${weekOffset - currentSessionPastAdjustment} wk`;
        }

        tableData += `

        <tr${rowAttribute}>

          <td>
            ${offset}
          </td>

          <td${coachAttribute}>
            ${coachSessionDatetime.format(format.date)}
          </td>
          <td${coachAttribute}>
            ${coachSessionDatetime.format(timeFormat)}
          </td>
          <td${coachAttribute}>
            ${coachTimeZoneData.abbreviation}
          </td>

          <td${clientAttribute}>
            ${clientSessionDatetime.format(format.date)}
          </td>
          <td${clientAttribute}>
            ${clientSessionDatetime.format(timeFormat)}
          </td>
          <td${clientAttribute}>
            ${clientTimeZoneData.abbreviation}
          </td>

        </tr>

        `;
    }

    $id('time-zone-comparison-cells').innerHTML = tableData;

    is12HourTime = timeFormat.includes('h');
    $id('switch-clock-format-button').innerHTML =
        is12HourTime ? 'Show in 24-hour time' : 'Show in 12-hour time';

    $id('time-zone-comparison-results').hidden = false;
    $id('switch-clock-format-container').hidden = false;
}

function switchClockFormatForComparison() {
    let newFormat;
    if (is12HourTime) {
        newFormat = format.time24Hour;
        $id('switch-clock-format-button').innerHTML = 'Show in 12-hour time';
        is12HourTime = false;

    } else {
        newFormat = format.time12Hour;
        $id('switch-clock-format-button').innerHTML = 'Show in 24-hour time';
        is12HourTime = true;
    }

    getTimeZoneComparison(newFormat);
}
