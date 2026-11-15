"use strict";
const API_URL = "https://6af9b9086d8b86fb22d72fab.mockapi.io/api/v1/sensors";
const container = document.querySelector("#sensors");
function showMessage(text, isError = false) {
    if (!container) {
        return;
    }
    const message = document.createElement("p");
    message.classList.add("sensors__message");
    if (isError) {
        message.classList.add("sensors__message--error");
    }
    message.textContent = text;
    container.replaceChildren(message);
}
function createSensorCard(sensor) {
    const card = document.createElement("article");
    const stateClass = sensor.status === "active" ? "sensor-card--active" : "sensor-card--inactive";
    card.classList.add("sensor-card", stateClass);
    const title = document.createElement("h3");
    title.textContent = sensor.name;
    const district = document.createElement("p");
    district.textContent = `Район: ${sensor.district}`;
    const level = document.createElement("p");
    level.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;
    const status = document.createElement("p");
    status.textContent = `Статус: ${sensor.status}`;
    card.append(title, district, level, status);
    return card;
}
function renderSensors(sensors) {
    if (!container) {
        return;
    }
    if (sensors.length === 0) {
        showMessage("Сенсорів поки немає.");
        return;
    }
    container.replaceChildren();
    sensors.forEach((sensor) => {
        container.append(createSensorCard(sensor));
    });
}
async function loadSensors() {
    showMessage("Завантаження даних…");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Не вдалося завантажити сенсори: ${response.status}`);
        }
        const sensors = await response.json();
        renderSensors(sensors);
    }
    catch (error) {
        console.error("Помилка:", error);
        showMessage("Не вдалося завантажити дані.", true);
    }
}
loadSensors();
