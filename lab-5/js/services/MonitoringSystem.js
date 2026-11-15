import { NoiseSensor } from "../models/NoiseSensor.js";

export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.findSensorById(sensor.id)) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
  }

  findSensorById(id) {
    return this.sensors.find((sensor) => sensor.id === id) ?? null;
  }

  getSensorsByDistrict(district) {
    return this.sensors.filter((sensor) => sensor.district === district);
  }

  getCriticalSensors() {
    return this.sensors.filter((sensor) => sensor.getStatus() === "critical");
  }

  getAverageNoiseLevel() {
    if (this.sensors.length === 0) {
      return null;
    }
    const total = this.sensors.reduce(
      (sum, sensor) => sum + sensor.noiseLevel,
      0
    );
    return total / this.sensors.length;
  }

  getDistricts() {
    return [...new Set(this.sensors.map((sensor) => sensor.district))];
  }
}
