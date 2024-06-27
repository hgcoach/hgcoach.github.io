let format;

class DatetimeFormats {

    constructor(components) {
        Object.assign(this, components);

        this.buildDateWithoutDotw();
        this.buildDateWithDotw();
        this.buildDate();

        this.build12HourTime();
        this.build24HourTime();
        this.buildTime();

        this.buildDatetimeWithoutDotw();
        this.buildDatetimeWithDotw();
        this.buildDatetime12Hour();
        this.buildDatetime24Hour();
        this.buildDatetime();
    }

    buildDateWithoutDotw() {
        let date = [];
        let day = this.day;
        switch (this.dateOrder) {

            case 'year month day':
                date.push(this.year, this.month, this.day);
                break;

            case 'day month year':
                if (this.separator === ' ' && this.dayOfTheWeek !== 'none' && this.day === 'Do') {
                    day = this.the + this.day + this.of;
                }

                date.push(day, this.month, this.year);
                break;

            case 'month day year':
                if (this.separator === ' ') {
                    day += this.comma;
                }

                date.push(this.month, day, this.year);
                break;

            default:
                throw new Error(`Invalid date order: '${this.dateOrder}'`);
        }

        switch (this.separator) {
            case '-':
            case '/':
                date = date.join(this.separator);
                break;
            case ' ':
                date.slice(0, 1).push(date[1] + this.comma, date[2])
                date = date.join(this.separator);
                break;
            default:
                throw new Error(`Invalid date separator: '${this.separator}'`);
        }

        this.dateWithoutDotw = date;
    }

    buildDateWithDotw() {
        this.dateWithDotw = (this.dayOfTheWeek === 'none') ?
            `ddd ${this.dateWithoutDotw}` :
            `${this.dayOfTheWeek}${this.comma} ${this.dateWithoutDotw}`;
    }

    buildDate() {
        this.date = (this.dayOfTheWeek !== 'none') ?
            this.dateWithDotw :
            this.dateWithoutDotw;
    }

    build12HourTime() {
        this.time12Hour = `${'h'.repeat(this.hourDigits)}:mm${this.amPm}`;
    }

    build24HourTime() {
        this.time24Hour = `${'H'.repeat(this.hourDigits)}:mm`;
    }

    buildTime() {
        switch (this.clock) {
            case '12':
                this.time = this.time12Hour;
                break;
            case '24':
                this.time = this.time24Hour;
                break;
            default:
                throw new Error(`Invalid clock format: '${this.clock}'`);
        }
    }

    buildDatetimeWithoutDotw() {
        this.datetimeWithoutDotw = `${this.dateWithoutDotw} ${this.at}${this.time}`;
    }

    buildDatetimeWithDotw() {
        this.datetimeWithDotw = `${this.dateWithDotw} ${this.at}${this.time}`;
    }

    buildDatetime12Hour() {
        this.datetime12Hour = `${this.date} ${this.at}${this.time12Hour}`;
    }

    buildDatetime24Hour() {
        this.datetime24Hour = `${this.date} ${this.at}${this.time24Hour}`;
    }

    buildDatetime() {
        this.datetime = `${this.date} ${this.at}${this.time}`;
    }
}

function validateYear(inputId, errorMessage) {
    const year = $id(inputId).value;

    if (year.length > 0 &&
        validNonNegativeInteger.test(year) &&
        parseInt(year) >= 100) {

        removeErrorState(inputId);

    } else {

        if (errorMessage == undefined) {
            errorMessage = `Year must be an integer ≥ 100... got '${year}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }
}

function validateMonth(inputId, errorMessage) {
    const month = $id(inputId).value;

    if (month.length > 0 &&
        validNonNegativeInteger.test(month) &&
        parseInt(month) > 0 &&
        parseInt(month) <= 12) {

        removeErrorState(inputId);

    } else {

        if (errorMessage == undefined) {
            errorMessage = `Month must be an integer 1-12... got '${month}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }
}

function validateDate(inputId, errorMessage) {
    const date = $id(inputId).value;

    if (!validDate.test(date)) {

        if (errorMessage == undefined) {
            errorMessage = `Date invalid: '${date}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }

    removeErrorState(inputId);
}

function validateTime(inputId, errorMessage) {
    const time = $id(inputId).value;

    if (!validTime.test(time)) {

        if (errorMessage == undefined) {
            errorMessage = `Time invalid: '${time}'`;
        }

        applyErrorState(inputId);
        return errorMessage;
    }

    removeErrorState(inputId);
}
