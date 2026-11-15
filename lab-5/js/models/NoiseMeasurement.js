import { NOISE_LIMITS } from "../config.js";

export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  isValid() {
    const validValue =
      Number.isFinite(this.value) &&
      this.value >= 0 &&
      this.value <= NOISE_LIMITS.absoluteMax;
    const validDate =
      this.measuredAt instanceof Date && !Number.isNaN(this.measuredAt.getTime());
    return validValue && validDate;
  }

  toString() {
    const time = this.measuredAt.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${time}, ${this.value} dB`;
  }
}
