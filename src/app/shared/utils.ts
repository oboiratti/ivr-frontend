export class DateHelpers {

  static secondsToTime(seconds: number) {
    if (isNaN(seconds)) { seconds = 0 }
    const d = new Date(null)
    d.setSeconds(seconds)
    return d.toISOString()
  }
}