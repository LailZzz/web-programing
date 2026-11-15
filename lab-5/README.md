# Лабораторна робота 5 — «Акустична варта»

Проєктування системи класів у JavaScript. Розмітка й стилі взяті з лабораторної 4, змінено організацію JavaScript.

## Структура

- `index.html` — розмітка, нова секція «Датчики шуму»
- `scss/` — вихідні стилі, `css/main.css` — результат компіляції
- `js/config.js` — межі класифікації шуму `NOISE_LIMITS`
- `js/models/` — `NoiseSensor`, `NoiseMeasurement`, `MobileNoiseSensor`
- `js/services/MonitoringSystem.js` — колекція датчиків
- `js/app.js` — ініціалізація, рендер карток, обробники подій

## Класи

| Клас | Стан | Поведінка | Взаємодії |
| --- | --- | --- | --- |
| NoiseSensor | id, district, location, noiseLevel, measurements | getStatus, updateNoiseLevel, addMeasurement, static isValidNoiseLevel, static fromObject | NoiseMeasurement, MonitoringSystem |
| NoiseMeasurement | value, measuredAt | isValid, toString | NoiseSensor |
| MonitoringSystem | sensors | addSensor, findSensorById, getSensorsByDistrict, getCriticalSensors, getAverageNoiseLevel | NoiseSensor |
| MobileNoiseSensor | batteryLevel | needsCharging | є різновидом NoiseSensor |

Композиція: `MonitoringSystem` → `NoiseSensor[]` → `NoiseMeasurement[]`.

## Що відрефакторено з лабораторної 4

- `classifyLevel(level, warning, critical)` → `NoiseSensor.getStatus()`
- `isValidLevel(level, min, max)` → `NoiseSensor.isValidNoiseLevel(value)`
- `calculateAverage(data, min, max)` → `MonitoringSystem.getAverageNoiseLevel()`
- `findFirstCritical(...)` → `MonitoringSystem.getCriticalSensors()`

## Запуск

```bash
npm install
npm run build
```

Відкрити `index.html` через Live Server.
