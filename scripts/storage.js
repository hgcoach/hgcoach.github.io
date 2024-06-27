/*
Purpose:
1. Determine if web storage is viable for each browser session
2. Automatically validate user settings and fix if broken
3. Contain all user settings manipulation and storage behind getter and setter
*/

class Storage {

    #items = {
        'theme': {
            'validValues': ['dark', 'light'],
            'default': 'dark',
            'value': undefined,
            'requiresSetup': true},
        'cohort': {
            'validValues': ['0-5', '6+'],
            'default': undefined,
            'value': undefined,
            'requiresSetup': false},
        'tier': {
            'validValues': ['core', 'advanced', 'master'],
            'default': undefined,
            'value': undefined,
            'requiresSetup': false},
        'timeZone': {
            'validValues': ['System'].concat(validTimeZones),
            'default': 'System',
            'value': undefined,
            'requiresSetup': false},
        'datetimeFormatComponents': {
            'validValues': {
                'dateOrder': ['month day year', 'day month year', 'year month day'],
                'dayOfTheWeek': ['dddd', 'ddd', 'none'],
                'year': ['YYYY', 'YY', '[\']YY'],
                'month': ['MMMM', 'MMM', 'MM', 'M'],
                'day': ['DD', 'D', 'Do'],
                'separator': [' ', '/', '-'],
                'comma': [',', ''],
                'the': ['[the] ', ''],
                'of': [' [of]', ''],
                'at': ['[at] ', ''],
                'clock': ['24', '12'],
                'hourDigits': ['2', '1'],
                'amPm': ['a', ' a', 'A', ' A']
            },
            'default': {
                'dateOrder': 'month day year',
                'dayOfTheWeek': 'ddd',
                'year': 'YYYY',
                'month': 'MMM',
                'day': 'Do',
                'separator': ' ',
                'comma': '',
                'the': '',
                'of': '',
                'at': '',
                'clock': '12',
                'hourDigits': '1',
                'amPm': 'a'
            },
            'value': undefined,
            'requiresSetup': true,
            '': true
        }
    }

    constructor() {
        this.firstLoad = true;
        this.determineMode();

        if (this.webStorageMode) {
            this.loadAll();
        } else {
            this.revertAll(false);
        }

        this.firstLoad = false;
        Object.seal(this);
    }

    determineMode() {
        try {
            localStorage.setItem('testKey', 'testValue');
            const testValue = localStorage.getItem('testKey');
            if (testValue !== 'testValue') {
                throw new Error(`Unexpected value returned for 'testKey': '${testValue}'`);
            }
            localStorage.removeItem('testKey');
            this.webStorageMode = true;
            console.log('%cWeb storage test succeeded. User settings will persist across sessions.',
                        'color: #88ff88');

        } catch (error) {
            this.webStorageMode = false;
            console.error(`Web storage test failed. User settings will not persist across sessions:
                          ${error}`);
        }
    }

    get(key) {
        this.validateKey(key);
        return this.#items[key].value;
    }

    set(key, value, isLoad = false, wasRepaired = false) {
        this.validateKey(key);

        let oldValue;
        if (key === 'theme') {
            oldValue = this.firstLoad ? undefined : $tag('html').getAttribute('data-theme');
            if (!this.firstLoad) {
                value = (oldValue === 'dark') ? 'light' : 'dark';
            }
        } else {
            oldValue = this.#items[key].value;
        }

        if (value == undefined) {
            delete this.#items[key].value;
        } else {
            this.#items[key].value = value;
        }

        let newValue = this.#items[key].value;

        if (typeof oldValue === 'object') {
            oldValue = JSON.stringify(oldValue);
        }

        if (typeof newValue === 'object') {
            newValue = JSON.stringify(newValue);
        }

        if (this.webStorageMode && (!isLoad || wasRepaired)) {
            if (newValue == undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, newValue);
            }
        }

        if (isLoad) {
            console.log(`Loaded '${key}': '%c${newValue}%c'`,
                        'color: #88ff88', 'color: #');
        } else if (newValue !== oldValue) {
            console.log(`Updated '${key}': '%c${oldValue}%c' → '%c${newValue}%c'`,
                        'color: #ff8888', 'color: #', 'color: #88ff88', 'color: #');
        }

        if (this.#items[key].requiresSetup) {

            switch (key) {

                case 'theme':
                    displayTheme(this.#items[key].value);
                    break;

                case 'datetimeFormatComponents':
                    const components = this.#items[key].value;
                    format = new DatetimeFormats(components);
                    break;

                default:
                    throw new Error(`Invalid setup key: '${key}'`);
            }
        }
    }

    revert(key) {
        const defaultValue = this.#items[key].default;
        this.set(key, defaultValue);
    }

    revertAll(themeExcluded = true) {
        for (const key in this.#items) {
            if (themeExcluded && key === 'theme') {
                continue;
            }
            this.revert(key);
        }
    }

    load(key) {
        try {
            let loadedValue = localStorage.getItem(key);
            try {
                if (loadedValue[0] !== '{' || loadedValue[loadedValue.length - 1] !== '}') {
                    throw new Error(`Invalid JSON string: ${loadedValue}`);
                }
                loadedValue = JSON.parse(loadedValue);

            } catch (error) {}

            let wasRepaired = false;

            if (typeof this.#items[key].default === 'object') {
                [loadedValue, wasRepaired] = this.validateSubkeyValues(key, loadedValue);
            } else {
                this.validateValue(key, loadedValue);
            }

            this.set(key, loadedValue, true, wasRepaired);
            return;

        } catch (error) { /*console.error(error.message)*/ }

        this.revert(key);
    }

    loadAll() {
        for (const key in this.#items) {
            this.load(key);
        }
    }

    validateKey(key) {
        if (!(key in this.#items)) {
            throw new Error(`Invalid storage key: '${key}'`);
        }
    }

    validateValue(key, value) {
        if (!this.#items[key].validValues.includes(value)) {
            throw new Error(`Invalid ${key} in storage: '${value}'`);
        }
    }

    validateSubkeyValues(key, subkeys) {
        let wasRepaired = false;

        const validSubkeyPairs = {};
        for (const [subkey, value] of Object.entries(subkeys)) {
            const validSubkeyValues = this.#items[key].validValues[subkey];
            if (validSubkeyValues != undefined && validSubkeyValues.includes(value)) {
                validSubkeyPairs[subkey] = value;
            } else {
                const defaultValue = this.#items[key].default[subkey];
                validSubkeyPairs[subkey] = defaultValue;
                wasRepaired = true;
                console.error(`Fixed '${subkey}': '%c${value}%c' → '%c${defaultValue}%c'`,
                        'color: #ff8888', 'color: #', 'color: #88ff88', 'color: #');
            }
        }

        const validSubkeys = Object.keys(validSubkeyPairs);
        const defaultSubkeyValues = this.#items[key].default;
        for (const [subkey, defaultValue] of Object.entries(defaultSubkeyValues)) {
            if (!validSubkeys.includes(subkey)) {
                validSubkeyPairs[subkey] = defaultValue;
                wasRepaired = true;
                console.error(`Fixed '${subkey}': '%c${undefined}%c' → '%c${defaultValue}%c'`,
                        'color: #ff8888', 'color: #', 'color: #88ff88', 'color: #');
            }
        }

        return [validSubkeyPairs, wasRepaired];
    }
}

const storage = new Storage();
