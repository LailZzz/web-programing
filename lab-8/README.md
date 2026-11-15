# Лабораторна робота 8 — «Акустична варта»

Робота з даними з API на TypeScript. Те саме завантаження сенсорів з MockAPI, що й у лабораторній 7, але з типами.

## Структура

- `index.html` — секція «Активні сенсори» з контейнером `#sensors`, підключає `dist/sensors.js`
- `src/sensors.ts` — `interface Sensor`, `loadSensors()`, `renderSensors()`
- `dist/sensors.js` — результат компіляції TypeScript
- `tsconfig.json` — налаштування компілятора
- `scss/`, `css/main.css` — стилі

## Запуск

```bash
npm install
npx tsc
```

Відкрити `index.html` через Live Server. Для автоматичної компіляції: `npx tsc --watch`.
