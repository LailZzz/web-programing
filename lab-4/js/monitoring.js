const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];
const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;
const safeSeriesLength = 3;

const limits = {
  warning: warningLevel,
  critical: criticalLevel,
  min: minValidLevel,
  max: maxValidLevel,
  seriesLength: safeSeriesLength
};

const testDatasets = [
  { name: "[]", data: [] },
  { name: "[-1, 141]", data: [-1, 141] },
  { name: "[70, 85, 86]", data: [70, 85, 86] },
  { name: "[90, 60, 65, 75, 50, 55, 60]", data: [90, 60, 65, 75, 50, 55, 60] },
  { name: "[90, 60, -1, 65, 62, 64]", data: [90, 60, -1, 65, 62, 64] }
];

const formatLevel = value => (value === null ? "немає даних" : `${value} dB`);

const formatAverage = value =>
  value === null
    ? "немає даних"
    : `${value.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} dB`;

const isAbove = (value, threshold) => value > threshold;

const classifyLevel = (level, warning, critical) => {
  if (level <= warning) {
    return "safe";
  }
  if (level <= critical) {
    return "warning";
  }
  return "critical";
};

const describeFound = result =>
  result === null ? "не знайдено" : `${formatLevel(result.value)}, позиція ${result.position}`;

const positionOf = result => (result === null ? "—" : result.position);

const pluralCritical = count => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "критичне вимірювання";
  }
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "критичні вимірювання";
  }
  return "критичних вимірювань";
};

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

function calculateAverage(data, min, max) {
  let sum = 0;
  let count = 0;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    sum += level;
    count++;
  }
  return count === 0 ? null : sum / count;
}

function findMinimum(data, min, max) {
  let result = null;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (result === null || level < result) {
      result = level;
    }
  }
  return result;
}

function findMaximum(data, min, max) {
  let result = null;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (result === null || level > result) {
      result = level;
    }
  }
  return result;
}

function findFirstCritical(data, critical, min, max) {
  let found = null;
  for (let index = 0; index < data.length; index++) {
    const level = data[index];
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (isAbove(level, critical)) {
      found = { index, position: index + 1, value: level };
      break;
    }
  }
  return found;
}

function findRecovery(data, firstCritical, warning, min, max, seriesLength) {
  if (firstCritical === null) {
    return null;
  }
  let index = firstCritical.index + 1;
  let streak = 0;
  while (index < data.length) {
    const level = data[index];
    if (isValidLevel(level, min, max) && level <= warning) {
      streak++;
      if (streak === seriesLength) {
        return { index, position: index + 1, value: level };
      }
    } else {
      streak = 0;
    }
    index++;
  }
  return null;
}

function findFirstValid(data, min, max) {
  if (data.length === 0) {
    return null;
  }
  let index = 0;
  do {
    if (isValidLevel(data[index], min, max)) {
      return { index, position: index + 1, value: data[index] };
    }
    index++;
  } while (index < data.length);
  return null;
}

function findInvalidEntries(data, min, max) {
  const entries = [];
  for (let index = 0; index < data.length; index++) {
    if (!isValidLevel(data[index], min, max)) {
      entries.push({ position: index + 1, value: data[index] });
    }
  }
  return entries;
}

const countByCategory = function (data, warning, critical, min, max) {
  const result = { total: 0, valid: 0, invalid: 0, safe: 0, warning: 0, critical: 0 };
  for (const level of data) {
    result.total++;
    if (!isValidLevel(level, min, max)) {
      result.invalid++;
      continue;
    }
    result.valid++;
    result[classifyLevel(level, warning, critical)]++;
  }
  return result;
};

function buildReport(data, settings, counter) {
  const counts = counter(data, settings.warning, settings.critical, settings.min, settings.max);
  const firstCritical = findFirstCritical(data, settings.critical, settings.min, settings.max);
  return {
    counts,
    average: calculateAverage(data, settings.min, settings.max),
    minimum: findMinimum(data, settings.min, settings.max),
    maximum: findMaximum(data, settings.min, settings.max),
    firstCritical,
    recovery: findRecovery(
      data,
      firstCritical,
      settings.warning,
      settings.min,
      settings.max,
      settings.seriesLength
    )
  };
}

function printReport(data, settings, report) {
  const { counts, average, minimum, maximum, firstCritical, recovery } = report;
  const invalidEntries = findInvalidEntries(data, settings.min, settings.max);
  const exceeded = counts.warning + counts.critical;

  console.group("Акустична варта — звіт моніторингу");
  console.log(`Пороги: попередження > ${settings.warning} dB; критичний рівень > ${settings.critical} dB`);
  console.log(`Усього вимірювань: ${counts.total}`);
  console.log(`Коректних: ${counts.valid}`);
  console.log(`Некоректних: ${counts.invalid}`);
  console.table([
    { Категорія: "Без перевищення", Кількість: counts.safe },
    { Категорія: "Попередження", Кількість: counts.warning },
    { Категорія: "Критичні", Кількість: counts.critical }
  ]);
  console.log(`Середній рівень: ${formatAverage(average)}`);
  console.log(`Мінімальний рівень: ${formatLevel(minimum)}`);
  console.log(`Максимальний рівень: ${formatLevel(maximum)}`);
  console.log(`Перше критичне вимірювання: ${describeFound(firstCritical)}`);
  console.log(`Відновлення — ${settings.seriesLength} безпечні вимірювання поспіль: ${describeFound(recovery)}`);

  if (exceeded > 0) {
    console.warn(`Поріг ${settings.warning} dB перевищено у ${exceeded} вимірюваннях.`);
  } else {
    console.log(`Поріг ${settings.warning} dB не перевищено.`);
  }

  if (invalidEntries.length > 0) {
    const parts = invalidEntries.map(entry => `позиція ${entry.position} (${entry.value} dB)`);
    console.error(`Некоректні дані: ${parts.join(", ")}.`);
  }

  if (counts.critical === 0) {
    console.log("Висновок: критичних вимірювань не зафіксовано.");
  } else if (recovery === null) {
    console.log(`Висновок: зафіксовано ${counts.critical} ${pluralCritical(counts.critical)};`);
    console.log("після першого з них стійкого відновлення не виявлено.");
  } else {
    console.log(`Висновок: зафіксовано ${counts.critical} ${pluralCritical(counts.critical)};`);
    console.log(`після першого з них відновлення зафіксовано на позиції ${recovery.position}.`);
  }
  console.groupEnd();
}

function printScenarioChecks(datasets, settings) {
  const rows = [];
  for (const dataset of datasets) {
    const report = buildReport(dataset.data, settings, countByCategory);
    const firstValid = findFirstValid(dataset.data, settings.min, settings.max);
    rows.push({
      Набір: dataset.name,
      Коректних: report.counts.valid,
      Середнє: formatAverage(report.average),
      Мінімум: formatLevel(report.minimum),
      Максимум: formatLevel(report.maximum),
      "Перший коректний": positionOf(firstValid),
      "Перше критичне": positionOf(report.firstCritical),
      Відновлення: positionOf(report.recovery)
    });
  }
  console.groupCollapsed("Перевірка окремих наборів даних");
  console.table(rows);
  console.groupEnd();
}

function runMonitoringReport() {
  const report = buildReport(noiseLevels, limits, countByCategory);
  printReport(noiseLevels, limits, report);
  printScenarioChecks(testDatasets, limits);
}

runMonitoringReport();
