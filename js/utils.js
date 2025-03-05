// Вспомогательные функции

/**
 * Преобразует дату из формата Excel в формат DD.MM.YYYY.
 * Excel хранит даты как число, представляющее количество дней с 01.01.1900.
 * Если дата в формате строки, возвращает её без изменений.
 *
 * @param {number|string} excelDate - Дата из Excel (число или строка).
 * @returns {string} - Преобразованная дата в формате DD.MM.YYYY.
 */
export function parseExcelDate(excelDate) {
  if (typeof excelDate === "number") {
    // Парсим числовую дату с использованием встроенной библиотеки XLSX
    const date = XLSX.SSF.parse_date_code(excelDate);

    // Форматируем день и месяц в двухзначный формат и объединяем в строку
    return `${String(date.d).padStart(2, "0")}.${String(date.m).padStart(
      2,
      "0"
    )}.${date.y}`;
  }
  // Возвращаем значение, если это строка или пустое значение
  return excelDate || "";
}

/**
 * Сохраняет данные в файл формата JSON.
 * Создаёт временный объект URL для загрузки файла.
 *
 * @param {Array|Object} data - Данные, которые нужно сохранить.
 * @param {string} filename - Имя файла, под которым он будет сохранён.
 */
export function saveToFile(data, filename) {
  // Преобразуем объект или массив в JSON-строку с отступами
  const jsonStr = JSON.stringify(data, null, 2);

  // Создаём Blob с типом application/json для данных
  const blob = new Blob([jsonStr], { type: "application/json" });

  // Генерируем временный URL для Blob
  const url = URL.createObjectURL(blob);

  // Создаём временный элемент <a> для симуляции клика и загрузки файла
  const a = document.createElement("a");
  a.href = url; // Устанавливаем ссылку на файл
  a.download = filename; // Указываем имя файла для скачивания
  a.click(); // Инициируем клик для начала загрузки

  // Освобождаем память, удаляя временный URL
  URL.revokeObjectURL(url);
}

/**
 * Читает содержимое файла как текст.
 * Использует FileReader для асинхронного чтения.
 *
 * @param {File} file - Объект файла, переданный через input[type="file"].
 * @returns {Promise<string>} - Промис, который возвращает содержимое файла как строку.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Успешное чтение файла
    reader.onload = (event) => resolve(event.target.result);

    // Ошибка при чтении файла
    reader.onerror = (event) => reject(event.target.error);

    // Начинаем чтение файла как текст
    reader.readAsText(file);
  });
}

// Создаём функцию для проверки пароля
export function checkPassword(callback) {
  console.log("checkPassword вызвана");
  const password = prompt("Введите пароль:");
  if (password === "1234") {
    console.log("Пароль верный");
    callback();
  } else {
    console.log("Неверный пароль");
    alert("Неверный пароль!");
  }
}
