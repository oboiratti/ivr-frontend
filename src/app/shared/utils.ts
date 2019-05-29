export class DateHelpers {

  static secondsToTime(seconds: number) {
    if (isNaN(seconds)) { seconds = 0 }
    const d = new Date(null)
    d.setSeconds(seconds)
    return d.toISOString()
  }

  static dateFromObj(dateObj: {year: number, month: number, day: number}) {
    const date = new Date()
    date.setFullYear(dateObj.year)
    date.setMonth(dateObj.month - 1)
    date.setDate(dateObj.day)
    return date
  }
}