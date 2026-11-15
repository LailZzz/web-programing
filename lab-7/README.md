# Лабораторна робота 7 — «Акустична варта»

Завантаження даних з MockAPI через `fetch()` та відображення сенсорів на сторінці.

## Структура

- `index.html` — секція «Активні сенсори» з контейнером `#sensors-list`
- `scss/` — вихідні стилі, `css/main.css` — результат компіляції
- `js/sensors.js` — `loadSensors()` (запит до API) і `renderSensors()` (картки в DOM)

## Налаштування

У `js/sensors.js` замінити `YOUR_PROJECT` в константі `API_URL` на адресу свого проєкту MockAPI.

## Запуск

```bash
npm install
npm run build
```

Відкрити `index.html` через Live Server.
