<<<<<<< HEAD
// jshint esversion: 6

function prepareDstLookup() {
    $id('time-zones').innerHTML = validTimeZonesHtmlString;
    $id('time-zone').value = getTimeZoneData('default').display;

    console.log('%cPrepared \'dst-lookup\'', 'color: #88ff88');
}

function getDstData() {
    const errorMessage = validateTimeZone('time-zone');
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const timeZone = getTimeZoneData('time-zone').identifier;
    const timeZoneData = moment.tz.zone(timeZone);

    const labelIds = ['next-change-prefix',
                       'next-change-local-label',
                       'next-change-local-prefix',
                       'last-change-prefix',
                       'last-change-local-label',
                       'last-change-local-prefix'];

    if (timeZoneData.offsets.length == 1) {
        $id('last-change-days').innerHTML = '';
        $id('last-change').innerHTML = 'DST not used';
        $id('last-change-local').innerHTML = '';

        $id('next-change-days').innerHTML = '';
        $id('next-change').innerHTML = 'DST not used';
        $id('next-change-local').innerHTML = '';

        if (!timeZone.includes('/') || timeZone.toLowerCase().includes('etc')) {
            $id('dst-warning').hidden = false;
        } else {
            $id('dst-warning').hidden = true;
        }

        for (const id of labelIds) {
            $id(id).hidden = true;
        }

        return;
    }

    $id('dst-warning').hidden = true;

    const timeZoneDataLocal = moment.tz.zone(dayjs.tz.guess());
    const timeChanges = timeZoneData.untils;

    const now = dayjs();
    const nowUnix = +now;
    let lastChangeIndex;
    let lastChangeUnix = -Infinity;

    for (const [i, timeChangeUnix] of timeChanges.entries()) {
        const delta = timeChangeUnix - nowUnix;
        const lastChangeDelta = lastChangeUnix - nowUnix;

        if (delta > 0) {
            break;
        }

        if (delta > lastChangeDelta) {
            lastChangeIndex = i;
            lastChangeUnix = timeChangeUnix;
        }
    }

    const nextChangeUnix = timeChanges[parseInt(lastChangeIndex) + 1];

    const lastChangeComponents = getDstDisplayComponents(lastChangeUnix, now, timeZoneData);
    const lastChangeComponentsLocal = getDstDisplayComponents(lastChangeUnix, now, timeZoneDataLocal);
    const nextChangeComponents = getDstDisplayComponents(nextChangeUnix, now, timeZoneData);
    const nextChangeComponentsLocal = getDstDisplayComponents(nextChangeUnix, now, timeZoneDataLocal);

    for (const id of labelIds) {
        $id(id).hidden = false;
    }

    $id('last-change-days').innerHTML = `${lastChangeComponents.timeFromNow} days ago...`;
    $id('last-change').innerHTML = lastChangeComponents.transitionString;
    $id('last-change-local').innerHTML = lastChangeComponentsLocal.transitionString;

    $id('next-change-days').innerHTML = `${nextChangeComponents.timeFromNow} days from now...`;
    $id('next-change').innerHTML = nextChangeComponents.transitionString;
    $id('next-change-local').innerHTML = nextChangeComponentsLocal.transitionString;
}

function getDstDisplayComponents(timeChangeUnix, now, timeZoneData) {
    const components = {};

    components.datetime = dayjs(timeChangeUnix);
    components.datetimeString = components.datetime
                                    .tz(timeZoneData.name)
                                    .format(getDatetimeFormat());
    components.abbreviation = timeZoneData.abbr(timeChangeUnix);

    components.beforeDatetime = components.datetime.subtract(1, 'minute');
    components.beforeDatetimeString = components.beforeDatetime
                                          .tz(timeZoneData.name)
                                          .format(getDatetimeFormat());
    components.beforeAbbreviation = timeZoneData.abbr(+components.beforeDatetime);

    components.timeFromNow = Math.abs(now.diff(components.datetime, 'day'));

    components.transitionString = `
        ${components.beforeDatetimeString} ${components.beforeAbbreviation}<br>
        ${components.datetimeString} ${components.abbreviation}`;

    return components;
}
=======
// jshint esversion: 6

function prepareDstLookup() {
    $id('time-zones').innerHTML = validTimeZonesHtmlString;
    $id('time-zone').value = getTimeZoneData('default').display;

    console.log('%cPrepared \'dst-lookup\'', 'color: #88ff88');
}

function getDstData() {
    const errorMessage = validateTimeZone('time-zone');
    if (errorMessage != undefined) {
        console.error(errorMessage);
        return;
    }

    const timeZone = getTimeZoneData('time-zone').identifier;
    const timeZoneData = moment.tz.zone(timeZone);

    const labelIds = ['next-change-prefix',
                       'next-change-local-label',
                       'next-change-local-prefix',
                       'last-change-prefix',
                       'last-change-local-label',
                       'last-change-local-prefix'];

    if (timeZoneData.offsets.length == 1) {
        $id('last-change-days').innerHTML = '';
        $id('last-change').innerHTML = 'DST not used';
        $id('last-change-local').innerHTML = '';

        $id('next-change-days').innerHTML = '';
        $id('next-change').innerHTML = 'DST not used';
        $id('next-change-local').innerHTML = '';

        if (!timeZone.includes('/') || timeZone.toLowerCase().includes('etc')) {
            $id('dst-warning').hidden = false;
        } else {
            $id('dst-warning').hidden = true;
        }

        for (const id of labelIds) {
            $id(id).hidden = true;
        }

        return;
    }

    $id('dst-warning').hidden = true;

    const timeZoneDataLocal = moment.tz.zone(dayjs.tz.guess());
    const timeChanges = timeZoneData.untils;

    const now = dayjs();
    const nowUnix = +now;
    let lastChangeIndex;
    let lastChangeUnix = -Infinity;

    for (const [i, timeChangeUnix] of timeChanges.entries()) {
        const delta = timeChangeUnix - nowUnix;
        const lastChangeDelta = lastChangeUnix - nowUnix;

        if (delta > 0) {
            break;
        }

        if (delta > lastChangeDelta) {
            lastChangeIndex = i;
            lastChangeUnix = timeChangeUnix;
        }
    }

    const nextChangeUnix = timeChanges[parseInt(lastChangeIndex) + 1];

    const lastChangeComponents = getDstDisplayComponents(lastChangeUnix, now, timeZoneData);
    const lastChangeComponentsLocal = getDstDisplayComponents(lastChangeUnix, now, timeZoneDataLocal);
    const nextChangeComponents = getDstDisplayComponents(nextChangeUnix, now, timeZoneData);
    const nextChangeComponentsLocal = getDstDisplayComponents(nextChangeUnix, now, timeZoneDataLocal);

    for (const id of labelIds) {
        $id(id).hidden = false;
    }

    $id('last-change-days').innerHTML = `${lastChangeComponents.timeFromNow} days ago...`;
    $id('last-change').innerHTML = lastChangeComponents.transitionString;
    $id('last-change-local').innerHTML = lastChangeComponentsLocal.transitionString;

    $id('next-change-days').innerHTML = `${nextChangeComponents.timeFromNow} days from now...`;
    $id('next-change').innerHTML = nextChangeComponents.transitionString;
    $id('next-change-local').innerHTML = nextChangeComponentsLocal.transitionString;
}

function getDstDisplayComponents(timeChangeUnix, now, timeZoneData) {
    const components = {};

    components.datetime = dayjs(timeChangeUnix);
    components.datetimeString = components.datetime
                                    .tz(timeZoneData.name)
                                    .format(getDatetimeFormat());
    components.abbreviation = timeZoneData.abbr(timeChangeUnix);

    components.beforeDatetime = components.datetime.subtract(1, 'minute');
    components.beforeDatetimeString = components.beforeDatetime
                                          .tz(timeZoneData.name)
                                          .format(getDatetimeFormat());
    components.beforeAbbreviation = timeZoneData.abbr(+components.beforeDatetime);

    components.timeFromNow = Math.abs(now.diff(components.datetime, 'day'));

    components.transitionString = `
        ${components.beforeDatetimeString} ${components.beforeAbbreviation}<br>
        ${components.datetimeString} ${components.abbreviation}`;

    return components;
}
>>>>>>> 4a789041cc4bf8c8831c5515259e265ce84182bc
