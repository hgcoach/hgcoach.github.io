function prepareDstInfo() {
    // configureTimeZoneInput('time-zone', 'default');
    displayWorldwideTimeChanges();

    console.log('%cPrepared \'dst-info\'', 'color: #88ff88');
}

function getDstData() {

    // Validate time zone input
    const errorMessage = validateTimeZone('time-zone');
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    // Make element ID arrays for looping
    const labelIds = ['next-change-prefix',
                      'last-change-prefix'];

    const localLabelIds = ['next-change-local-label',
                           'next-change-local-prefix',
                           'last-change-local-label',
                           'last-change-local-prefix'];

    const localIds = localLabelIds.concat(['next-change-local',
                                           'last-change-local']);

    const nextChangeIds = ['next-change-prefix',
                          'next-change-local-label',
                          'next-change-local-prefix'];

    const lastChangeIds = ['last-change-prefix',
                          'last-change-local-label',
                          'last-change-local-prefix'];

    // From input, get time zone identifier and its moment.js data
    // const timeZone = getTimeZoneData('time-zone').identifier;
    // const timeZoneData = moment.tz.zone(timeZone);

    const timeZoneData = getTimeZoneData('time-zone');
    const timeZone = timeZoneData.identifier;

    // From system, get time zone identifier and determine if comparison is needed
    const localTimeZone = getTimeZoneData('default').identifier;
    const localEquivalentRequired = (timeZone !== localTimeZone);

    /* If only one UTC offset is found, update the page to show that the time zone
    does not use time changes, display the locale warning, hide unnecessary
    information, and exit the function */
    if (timeZoneData.offsets.length == 1) {
        $id('next-change-days').innerHTML = '';
        $id('next-change').innerHTML = 'DST not used';
        $id('next-change-local').innerHTML = '';

        $id('last-change-days').innerHTML = '';
        $id('last-change').innerHTML = 'DST not used';
        $id('last-change-local').innerHTML = '';

        if (!timeZone.includes('/') || timeZone.toLowerCase().includes('etc')) {
            $id('dst-warning').hidden = false;
        } else {
            $id('dst-warning').hidden = true;
        }

        for (const id of labelIds.concat(localLabelIds)) {
            $id(id).hidden = true;
        }

        return;
    }

    // If more than one UTC offset exists, ensure the locale warning is hidden
    $id('dst-warning').hidden = true;

    // Get the unixes for the time zone's time changes
    // const timeChanges = timeZoneData.untils;

    // Capture the current unix and get the unix of the last and next time changes
    const now = dayjs();
    const [lastTimeChangeUnix, nextTimeChangeUnix] = getLastAndNextTimeChangeUnixes(timeZone, +now);

    /* From the last and next unixes, get their respective day.js objects, datetime
    strings, and time zone abbreviations right after the time change as well as
    1 minute before the time change. Also get the amount of time since/until each
    time change at 2-unit depth. */
    const nextChangeComponents = getDstDisplayComponents(nextTimeChangeUnix, now, timeZoneData);
    const lastChangeComponents = getDstDisplayComponents(lastTimeChangeUnix, now, timeZoneData);

    for (const id of labelIds) {
        $id(id).hidden = false;
    }

    $id('next-change-days').innerHTML = `${nextChangeComponents.timeFromNow} from now...`;
    $id('next-change').innerHTML = nextChangeComponents.transitionString;

    $id('last-change-days').innerHTML = `${lastChangeComponents.timeFromNow} ago...`;
    $id('last-change').innerHTML = lastChangeComponents.transitionString;

    if (localEquivalentRequired) {
        const timeZoneDataLocal = moment.tz.zone(localTimeZone);
        const lastChangeComponentsLocal =
            getDstDisplayComponents(lastTimeChangeUnix, now, timeZoneDataLocal);
        const nextChangeComponentsLocal =
            getDstDisplayComponents(nextTimeChangeUnix, now, timeZoneDataLocal);
        $id('next-change-local').innerHTML = nextChangeComponentsLocal.transitionString;
        $id('last-change-local').innerHTML = lastChangeComponentsLocal.transitionString;
    }

    for (const id of localIds) {
        $id(id).hidden = !localEquivalentRequired;
    }

    const dstNoLongerUsed = nextChangeComponents.timeFromNow.includes('NaN');
    if (dstNoLongerUsed) {
        $id('next-change-days').innerHTML = '';
        $id('next-change-local').innerHTML = '';
        for (const id of nextChangeIds) {
            $id(id).hidden = true;
        }

        $id('next-change').innerHTML = 'DST no longer used';
        return;
    }

    const dstNotUsedRecently = lastChangeComponents.timeFromNow.includes('NaN');
    if (dstNotUsedRecently) {
        $id('last-change-days').innerHTML = '';
        $id('last-change-local').innerHTML = '';
        for (const id of lastChangeIds) {
            $id(id).hidden = true;
        }

        $id('last-change').innerHTML = 'DST not used in recent years';
        return;
    }
}

function getDstDisplayComponents(timeChangeUnix, now, timeZoneData) {
    const components = {};

    console.log('%cstart', 'color: #ff8888');
    console.log(timeZoneData.identifier);
    console.log(timeChangeUnix);

    // Get time change datetime object
    // components.datetime = dayjs(timeChangeUnix);
    components.datetime = dayjs.tz(timeChangeUnix, timeZoneData.identifier);

    // Get time change datetime string
    // components.datetimeString = components.datetime
    //                                 .tz(timeZoneData.name)
    //                                 .format(format.datetime);
    components.datetimeString = components.datetime.format(format.datetime);

    // Get time change time zone abbreviation
    // components.abbreviation = getTimeZoneData('time-zone', timeChangeUnix).abbreviation;
    components.abbreviation = moment.tz.zone(timeZoneData.identifier).abbr(timeChangeUnix);

    // Get pre-time change datetime object
    components.beforeDatetime = components.datetime.subtract(1, 'minute');

    // Get pre-time change datetime string
    // components.beforeDatetimeString = components.beforeDatetime
    //                                       .tz(timeZoneData.name)
    //                                       .format(format.datetime);
    components.beforeDatetimeString = components.beforeDatetime.format(format.datetime);

    // Get pre-time change time zone abbreviation
    components.beforeAbbreviation = moment.tz.zone(timeZoneData.identifier).abbr(+components.beforeDatetime);
        // getTimeZoneData('time-zone', +components.beforeDatetime).abbreviation;

    console.log(`before = ${components.beforeDatetimeString} ${components.beforeAbbreviation}`);
    console.log(`time change = ${components.datetimeString} ${components.abbreviation}`);

    // Get time difference
    components.timeFromNow = getTimeDifferenceInUnits(now, components.datetime);

    // Compose HTML string
    components.transitionString = `
        ${components.beforeDatetimeString} ${components.beforeAbbreviation}<br>
        ${components.datetimeString} ${components.abbreviation}`;

    console.log('%cend', 'color: #ff8888');

    return components;
}

function getTimeDifferenceInUnits(startTime, endTime) {
    if (Number.isInteger(startTime)) {
        startTime = dayjs(startTime).utc();
    }

    if (Number.isInteger(endTime)) {
        endTime = dayjs(endTime).utc();
    }

    const endPrecedesStart = startTime.diff(endTime, 'ms') > 0;
    if (isNaN(endPrecedesStart)) {
        return undefined;
    }

    const timeFromNowAsUnit = {};
    const units = ['year', 'month', 'week', 'day', 'hour', 'minute'];
    let lastUnitTruncatedDate = startTime;

    let timeFromNow = [];
    let previousUnitIsNonZero = false;
    let hasTwoUnitDepth = false;

    for (const unit of units) {
        const key = `${unit}sFromNow`;

        const difference = Math.abs(lastUnitTruncatedDate.diff(endTime, unit));
        const truncatedDate = endPrecedesStart ?
                              lastUnitTruncatedDate.subtract(difference, unit) :
                              lastUnitTruncatedDate.add(difference, unit);

        timeFromNowAsUnit[key] = {
            'difference': difference,
            'truncatedDate': truncatedDate,
        }

        if (difference !== 0 && !hasTwoUnitDepth) {
            timeFromNow.push(`${difference} ${unit + (difference === 1 ? '' : 's')}`);
            if (previousUnitIsNonZero) {
                hasTwoUnitDepth = true;
            }
            previousUnitIsNonZero = true;
        }

        lastUnitTruncatedDate = truncatedDate;
    }

    return timeFromNow.join(' and ');
}

function displayWorldwideTimeChanges() {
    const timeZones = validTimeZones.toSpliced(validTimeZones.indexOf('Factory', 1));

    const nowUnix = +dayjs();
    let recentTimeChanges = [];
    let upcomingTimeChanges = [];
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const months = 2;
    const maxDelta = months * 31 * dayInMilliseconds;

    for (const timeZone of timeZones) {
        const [lastTimeChangeUnix, nextTimeChangeUnix] =
            getLastAndNextTimeChangeUnixes(timeZone, nowUnix);

        if (lastTimeChangeUnix == null && nextTimeChangeUnix == null) {
            continue;
        } 

        if (nowUnix - lastTimeChangeUnix <= maxDelta) {
            recentTimeChanges.push([timeZone, lastTimeChangeUnix]);
        }

        if (nextTimeChangeUnix - nowUnix <= maxDelta) {
            upcomingTimeChanges.push([timeZone, nextTimeChangeUnix]);
        }
    }

    // Sort by time change (most to least recent), then alphabetically
    recentTimeChanges.sort((a, b) =>
        a[1] === b[1] ? a[0].localeCompare(b[0]) : b[1] - a[1]);

    // Sort by time change (most to least soon), then alphabetically
    upcomingTimeChanges.sort((a, b) =>
        a[1] === b[1] ? a[0].localeCompare(b[0]) : a[1] - b[1]);

    let recentTimeChangeRows = '';
    for (const [timeZone, timeChangeUnix] of recentTimeChanges) {

        recentTimeChangeRows += `
            <tr>
              <th>${timeZone}</th>
              <td>${getTimeDifferenceInUnits(nowUnix, timeChangeUnix)} ago</td>
            </tr>
            `;
    }

    if (recentTimeChangeRows === '') {
        recentTimeChangeRows += `
            <tr>
              <th>None in the last ${months} ${months === 1 ? 'month' : 'months'}</th>
            </tr>
            `;
    }

    let upcomingTimeChangeRows = '';
    for (const [timeZone, timeChangeUnix] of upcomingTimeChanges) {

        upcomingTimeChangeRows += `
            <tr>
              <th>${timeZone}</th>
              <td>${getTimeDifferenceInUnits(timeChangeUnix, nowUnix)} from now</td>
            </tr>
            `;
    }

    if (upcomingTimeChangeRows === '') {
        upcomingTimeChangeRows += `
            <tr>
              <th>None in the next ${months} ${months === 1 ? 'month' : 'months'}</th>
              <td></td>
            </tr>
            `;
    }

    $id('recent-time-changes').innerHTML = recentTimeChangeRows;
    $id('upcoming-time-changes').innerHTML = upcomingTimeChangeRows;
}

function getLastAndNextTimeChangeUnixes(timeZone, nowUnix) {
    const timeZoneData = moment.tz.zone(timeZone);

    if (timeZoneData.offsets.length === 1) {
        return [null, null];
    }

    const timeChanges = timeZoneData.untils;

    let lastTimeChangeIndex;
    let lastTimeChangeUnix = -Infinity;

    for (const [i, timeChangeUnix] of timeChanges.entries()) {
        const delta = timeChangeUnix - nowUnix;
        const lastChangeDelta = lastTimeChangeUnix - nowUnix;

        if (delta > 0) {
            break;
        }

        if (delta > lastChangeDelta) {
            lastTimeChangeIndex = i;
            lastTimeChangeUnix = timeChangeUnix;
        }
    }

    const nextTimeChangeUnix = timeChanges[parseInt(lastTimeChangeIndex ?? -1) + 1];

    return [lastTimeChangeUnix, nextTimeChangeUnix];
}
