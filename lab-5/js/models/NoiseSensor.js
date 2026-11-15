import { NOISE_LIMITS } from "../config.js";
import { NoiseMeasurement } from "./NoiseMeasurement.js";

export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new Error(`Некоректний початковий рівень шуму: ${noiseLevel}`);
    }
    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = [];
  }

  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
      return "normal";
    }
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
      return "warning";
    }
    return "critical";
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new Error(
        `Рівень шуму має бути числом від 0 до ${NOISE_LIMITS.absoluteMax} dB`
      );
    }
    this.noiseLevel = value;
  }

  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new Error("Очікується об'єкт NoiseMeasurement");
    }
    if (!measurement.isValid()) {
      throw new Error(
        `Некоректне вимірювання: допустимо від 0 до ${NOISE_LIMITS.absoluteMax} dB`
      );
    }
    this.measurements.push(measurement);
    this.updateNoiseLevel(measurement.value);
  }

  getLastMeasurement() {
    return this.measurements.at(-1) ?? null;
  }

  static isValidNoiseLevel(value) {
    return (
      Number.isFinite(value) && value >= 0 && value <= NOISE_LIMITS.absoluteMax
    );
  }

  static fromObject(data) {
    const requiredFields = ["id", "district", "location", "noiseLevel"];
    const missing = requiredFields.filter((field) => !(field in data));
    if (missing.length > 0) {
      throw new Error(`Бракує полів для датчика: ${missing.join(", ")}`);
    }
    return new NoiseSensor(
      data.id,
      data.district,
      data.location,
      data.noiseLevel
    );
  }
}
