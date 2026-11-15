import { NoiseSensor } from "./models/NoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
  {
    id: "NS-01",
    district: "Галицький",
    location: "просп. Свободи",
    noiseLevel: 58,
  },
  {
    id: "NS-02",
    district: "Франківський",
    location: "вул. Наукова",
    noiseLevel: 74,
  },
  {
    id: "NS-03",
    district: "Шевченківський",
    location: "просп. Чорновола",
    noiseLevel: 83,
  },
];

const STATUS_LABELS = {
  normal: "Норма",
  warning: "Увага",
  critical: "Критично",
};

const system = new MonitoringSystem();

sensorsData
  .map((data) => NoiseSensor.fromObject(data))
  .forEach((sensor) => system.addSensor(sensor));

system.addSensor(
  new MobileNoiseSensor("NS-04", "Личаківський", "вул. Городоцька", 49, 15)
);

const view = { district: "all", mode: "all" };

const $ = (id) => document.getElementById(id);

function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const last = sensor.getLastMeasurement();
  const lastRow = last
    ? `<p class="card__note">Останнє: ${last.toString()}</p>`
    : "";
  const batteryRow =
    sensor instanceof MobileNoiseSensor
      ? `<p class="card__note">Батарея: ${sensor.batteryLevel}%${
          sensor.needsCharging() ? ", потрібна зарядка" : ""
        }</p>`
      : "";

  const card = document.createElement("article");
  card.className = `card card--${status}`;
  card.innerHTML = `
    <p class="card__label">${sensor.id}</p>
    <p class="card__value">${sensor.noiseLevel} dB</p>
    <span class="badge badge--${status}">${STATUS_LABELS[status]}</span>
    <p class="card__note">${sensor.district} район, ${sensor.location}</p>
    <p class="card__note">Вимірювань: ${sensor.measurements.length}</p>
    ${lastRow}
    ${batteryRow}`;
  return card;
}

function getVisibleSensors() {
  const sensors =
    view.district === "all"
      ? system.sensors
      : system.getSensorsByDistrict(view.district);
  if (view.mode === "critical") {
    const critical = new Set(system.getCriticalSensors());
    return sensors.filter((sensor) => critical.has(sensor));
  }
  return sensors;
}

function renderStats() {
  const average = system.getAverageNoiseLevel();
  $("stat-total").textContent = system.sensors.length;
  $("stat-critical").textContent = system.getCriticalSensors().length;
  $("stat-average").textContent =
    average === null ? "—" : `${average.toFixed(2)} dB`;
}

function renderAlert() {
  const critical = system.getCriticalSensors();
  $("warning").hidden = critical.length === 0;
  $("warning-text").textContent =
    critical.length === 0
      ? ""
      : `Критичний рівень шуму: ${critical
          .map((sensor) => `${sensor.id} (${sensor.noiseLevel} dB)`)
          .join(", ")}. Дані передано на додатковий аналіз.`;
}

function renderSensors() {
  const sensors = getVisibleSensors();
  const container = $("sensors-list");
  if (sensors.length === 0) {
    const empty = document.createElement("p");
    empty.className = "card__text";
    empty.textContent = "За цими фільтрами датчиків немає.";
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...sensors.map(renderSensorCard));
}

function render() {
  renderStats();
  renderAlert();
  renderSensors();
}

function fillSelects() {
  $("district-filter").replaceChildren(
    new Option("Усі райони", "all"),
    ...system.getDistricts().map((district) => new Option(district, district))
  );
  $("measurement-sensor").replaceChildren(
    ...system.sensors.map(
      (sensor) => new Option(`${sensor.id}, ${sensor.district}`, sensor.id)
    )
  );
}

function setMessage(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("form-message--error", isError);
}

$("district-filter").addEventListener("change", (event) => {
  view.district = event.target.value;
  renderSensors();
});

$("mode-filter").addEventListener("change", (event) => {
  view.mode = event.target.value;
  renderSensors();
});

$("search-id").addEventListener("input", (event) => {
  const id = event.target.value.trim().toUpperCase();
  const result = $("search-result");
  if (id === "") {
    setMessage(result, "");
    return;
  }
  const sensor = system.findSensorById(id);
  if (!sensor) {
    setMessage(result, `Датчика ${id} немає в системі.`, true);
    return;
  }
  setMessage(
    result,
    `${sensor.id}: ${sensor.district} район, ${sensor.location}, ${sensor.noiseLevel} dB, ${STATUS_LABELS[sensor.getStatus()]}.`
  );
});

$("measurement-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = $("measurement-message");
  try {
    const sensor = system.findSensorById($("measurement-sensor").value);
    const value = Number($("measurement-value").value);
    sensor.addMeasurement(new NoiseMeasurement(value));
    setMessage(
      message,
      `${sensor.id}: ${value} dB, статус: ${STATUS_LABELS[sensor.getStatus()]}.`
    );
    $("measurement-value").value = "";
    render();
  } catch (error) {
    setMessage(message, error.message, true);
  }
});

function runConsoleExperiments() {
  const sensorA = system.sensors[0];
  const sensorB = system.sensors[1];
  console.log("getStatus однакова функція:", sensorA.getStatus === sensorB.getStatus);
  console.log("noiseLevel власна властивість:", Object.hasOwn(sensorA, "noiseLevel"));
  console.log("getStatus власна властивість:", Object.hasOwn(sensorA, "getStatus"));
  console.log("getStatus у prototype:", Object.hasOwn(NoiseSensor.prototype, "getStatus"));
  console.log("Середній рівень:", system.getAverageNoiseLevel());
  try {
    const detached = sensorA.getStatus;
    detached();
  } catch (error) {
    console.log("Виклик без об'єкта:", error.message);
  }
}

Object.assign(window, { system, NoiseSensor, NoiseMeasurement, MobileNoiseSensor });

fillSelects();
render();
runConsoleExperiments();
