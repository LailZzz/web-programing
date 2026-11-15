import { LOW_BATTERY_LEVEL } from "../config.js";
import { NoiseSensor } from "./NoiseSensor.js";

export class MobileNoiseSensor extends NoiseSensor {
  constructor(id, district, location, noiseLevel, batteryLevel) {
    super(id, district, location, noiseLevel);
    this.batteryLevel = batteryLevel;
  }

  needsCharging() {
    return this.batteryLevel < LOW_BATTERY_LEVEL;
  }
}
