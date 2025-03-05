import { saveStudents, loadStudents } from "./indexedDB.js";
import { saveToFile, parseExcelDate, readFileAsText } from "./utils.js";

// Элементы DOM
export const tableBody = document.querySelector("#student-table tbody");
const notification = document.getElementById("notification");

// Глобальные переменные
export let students = [];

// ******************** РАБОТА С ТАБЛИЦЕЙ ********************

// Переключение бургер-меню
document.querySelector(".fa-cogs").addEventListener("click", (event) => {
  event.stopPropagation();
  document.querySelector(".menu-container").classList.toggle("active");
});

// Закрытие меню при клике вне его области
document.addEventListener("click", (event) => {
  const menuContainer = document.querySelector(".menu-container");
  if (
    !menuContainer.contains(event.target) &&
    !event.target.closest(".fa-cogs")
  ) {
    menuContainer.classList.remove("active");
  }
});

// Функция для обновления таблицы
export function updateTable(data) {
  tableBody.innerHTML = "";
  data.forEach((student) => {
    const row = document.createElement("tr");
    Object.entries(student).forEach(([key, value]) => {
      if (key !== "id") {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      }
    });
    tableBody.appendChild(row);
  });
}

// ******************** ОБРАБОТКА СОБЫТИЙ ********************

document.addEventListener("DOMContentLoaded", async () => {
  students = await loadStudents();
  if (students.length) {
    updateTable(students);
  } else {
    notification.style.display = "block";
  }

  const buttons = {
    uploadButton: document.getElementById("upload-xlsx"),
    uploadInput: document.getElementById("upload"),
    downloadJsonButton: document.getElementById("download-json"),
    loadJsonButton: document.getElementById("load-json"),
    downloadXlsxButton: document.getElementById("download-xlsx-file"),
  };

  // Проверка наличия кнопок
  if (!buttons.uploadButton || !buttons.uploadInput) {
    console.error("Не удалось найти элементы кнопки или input!");
    return;
  }

  setupEventListeners(buttons);
});

// ******************** УСТАНОВКА СЛУШАТЕЛЕЙ СОБЫТИЙ ********************

function setupEventListeners(buttons) {
  // Открыть диалог выбора файла для Excel
  buttons.uploadButton.addEventListener("click", () =>
    buttons.uploadInput.click()
  );

  // Обработка выбора файла Excel
  buttons.uploadInput.addEventListener("change", handleExcelUpload);

  // Сохранить данные в JSON
  buttons.downloadJsonButton.addEventListener("click", async () => {
    const data = await loadStudents();
    if (data.length) saveToFile(data, "students_data.json");
    else alert("Нет данных для сохранения!");
  });

  // Загрузка данных из JSON
  buttons.loadJsonButton.addEventListener("click", handleJsonUpload);

  // Сохранение данных в XLSX
  buttons.downloadXlsxButton.addEventListener("click", handleXlsxDownload);
}

// ******************** ФУНКЦИИ ДЛЯ ОБРАБОТКИ ФАЙЛОВ ********************

// Обработка загрузки файла Excel
async function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return alert("Выберите файл!");

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { range: 2 });

      students = jsonData.map(formatStudentData);
      await saveStudents(students);
      updateTable(students);
    } catch (error) {
      alert("Ошибка при обработке файла: " + error.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// Форматирование данных из Excel
function formatStudentData(row) {
  return {
    number: row["№"],
    name: row["ФИО"] || "",
    nameEn: row["ФИО (англ)"] || "",
    order: parseExcelDate(row["Приказ"]),
    orderDate: parseExcelDate(row["Дата приказа"]),
    birthYear: parseExcelDate(row["Год рождения"]),
    country: row["Страна"] || "",
    gender: row["Пол"] || "",
    passport: String(
      row["Серия и номер паспорта, дата выдачи, срок действия"] || ""
    ),
    group: row["Группа"] || "",
    faculty: row["Факультет"] || "",
    course: row["Курс"] || "",
    note: row["Примечание*"] || "",
    educationForm: row["Форма обучения"] || "",
    residencePermission: row["Разрешение на временное пребывание"] || "",
    day1: row["День"] || "",
    month1: row["Месяц"] || "",
    year1: row["Год"] || "",
    day2: row["День_"] || "",
    month2: row["Месяц_"] || "",
    year2: row["Год_"] || "",
    homeAddress: row["Домашний адрес"] || "",
    dormOrApartment: row["Общежитие/квартира"] || "",
    enrollmentYear: row["Год поступления"] || "",
    graduationYear: row["Год окончания"] || "",
    note2: row["Примечание**"] || "",
    curator: row["Куратор"] || "",
    phoneCurator: row["Телефон куратора"] || "",
    phoneStudent: row["Телефон студента"] || "",
    note3: row["Примечание***"] || "",
  };
}

// Обработка загрузки JSON
async function handleJsonUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.click();

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return alert("Выберите файл!");

    try {
      const jsonData = await readFileAsText(file);
      students = JSON.parse(jsonData);
      await saveStudents(students);
      updateTable(students);
    } catch (error) {
      alert("Ошибка при обработке файла JSON: " + error.message);
    }
  });
}

// Обработка скачивания данных в XLSX (код сокращен для наглядности)
async function handleXlsxDownload() {
  try {
    const studentsData = await loadStudents();
    if (!studentsData.length) return alert("Нет данных для сохранения!");

    // Логика для создания и скачивания файла XLSX

    // Получаем таблицу из DOM
    const table = document.querySelector("table"); // Убедитесь, что у таблицы есть селектор
    if (!table) {
      alert("Таблица не найдена!");
      return;
    }

    // Извлекаем ширину столбцов
    const columnWidths = Array.from(table.querySelectorAll("th")).map((th) => {
      return th.offsetWidth / 7; // Делим на 7, чтобы Excel лучше подстроил ширину
    });

    // Извлекаем высоту строк
    const rowHeights = Array.from(table.querySelectorAll("tr")).map((tr) => {
      return tr.offsetHeight / 1.5; // Коэффициент подбора для Excel
    });

    // Создаём книгу Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    // Устанавливаем столбцы с шириной
    const columns = [
      { header: "№", key: "number", width: 6 },
      { header: "ФИО", key: "name", width: 35 },
      { header: "ФИО (англ)", key: "nameEn", width: 35 },
      { header: "Приказ", key: "order", width: 16 },
      {
        header: "Дата приказа",
        key: "orderDate",
        width: 16,
      },
      {
        header: "Год рождения",
        key: "birthYear",
        width: 14,
      },
      { header: "Страна", key: "country", width: 21 },
      { header: "Пол", key: "gender", width: 14 },
      {
        header: "Серия и номер паспорта, дата выдачи, срок действия",
        key: "passport",
        width: 45,
      },
      { header: "Группа", key: "group", width: 20 },
      { header: "Факультет", key: "faculty", width: 15 },
      { header: "Курс", key: "course", width: 8 },
      { header: "Примечание*", key: "note", width: 23 },
      {
        header: "Форма обучения",
        key: "educationForm",
        width: 20,
      },
      {
        header: "Разрешение на временное пребывание",
        key: "residencePermission",
        width: 30,
      },
      { header: "День", key: "day1", width: 7 },
      { header: "Месяц", key: "month1", width: 10 },
      { header: "Год", key: "year1", width: 10 },
      { header: "День_", key: "day2", width: 7 },
      { header: "Месяц_", key: "month2", width: 10 },
      { header: "Год_", key: "year2", width: 10 },
      {
        header: "Домашний адрес",
        key: "homeAddress",
        width: 51,
      },
      {
        header: "Общежитие/квартира",
        key: "dormOrApartment",
        width: 21,
      },
      {
        header: "Год поступления",
        key: "enrollmentYear",
        width: 16,
      },
      {
        header: "Год окончания",
        key: "graduationYear",
        width: 16,
      },
      { header: "Примечание**", key: "note2", width: 25 },
      { header: "Куратор", key: "curator", width: 21 },
      {
        header: "Телефон куратора",
        key: "phoneCurator",
        width: 22,
      },
      {
        header: "Телефон студента",
        key: "phoneStudent",
        width: 22,
      },
      {
        header: "Примечание***",
        key: "note3",
        width: 16,
      },
    ];

    sheet.columns = columns; // Устанавливаем столбцы

    // Добавляем шапку (первая строка)
    const firstHeaderRow = sheet.getRow(1);
    firstHeaderRow.values = [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Разрешение на временное пребывание с",
      "",
      "",
      "Разрешение на временное пребывание по",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    // Объединяем ячейки для "Разрешение на временное пребывание с" и "Разрешение на временное пребывание по"
    sheet.mergeCells("P1:R1"); // Объединяем 3 ячейки для "Разрешение на временное пребывание с"
    sheet.mergeCells("S1:U1"); // Объединяем 3 ячейки для "Разрешение на временное пребывание по"

    // Устанавливаем стиль для первой строки (firstHeaderRow)
    firstHeaderRow.font = { bold: true, color: { argb: "000000" } }; // Черный жирный текст
    firstHeaderRow.eachCell((cell) => {
      cell.font = {
        name: "Times New Roman",
        size: 10,
        bold: true,
        color: { argb: "000000" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      // Устанавливаем бирюзовый фон
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "40E0D0" }, // Бирюзовый цвет
      };
      // Добавляем границы для всех ячеек в первой строке
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });

    // Добавляем вторую строку (основная шапка)
    const headerRow = sheet.getRow(2);
    headerRow.values = [
      "№",
      "ФИО",
      "ФИО (англ)",
      "Приказ",
      "Дата приказа",
      "Год рождения",
      "Страна",
      "Пол",
      "Серия и номер паспорта, дата выдачи, срок действия",
      "Группа",
      "Факультет",
      "Курс",
      "Примечание*",
      "Форма обучения",
      "Разрешение на временное пребывание",
      "День",
      "Месяц",
      "Год",
      "День_",
      "Месяц_",
      "Год_",
      "Домашний адрес",
      "Общежитие/квартира",
      "Год поступления",
      "Год окончания",
      "Примечание**",
      "Куратор",
      "Телефон куратора",
      "Телефон студента",
      "Примечание***",
    ];

    // Устанавливаем стиль для основной шапки (headerRow)
    headerRow.font = { bold: true, color: { argb: "000000" } }; // Черный жирный текст
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Times New Roman",
        size: 10,
        bold: true,
        color: { argb: "000000" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      // Устанавливаем бирюзовый фон
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "40E0D0" }, // Бирюзовый цвет
      };
      // Добавляем границы для всех ячеек во второй строке
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    });

    // sheet.getRow(2).height = rowHeights[0] || 40; // Высота заголовка
    sheet.getRow(1).height = 90; // Высота заголовка
    sheet.getRow(2).height = 90; // Высота заголовка

    // Добавляем данные студентов
    studentsData.forEach((student, index) => {
      const row = sheet.addRow(student);
      // row.height = rowHeights[index + 1] || 40; // Устанавливаем высоту строки
      row.height = 90; // Устанавливаем высоту строки
      row.eachCell((cell) => {
        cell.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: "center",
        };
        // Добавляем границы для каждой ячейки
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
      });
    });

    // Генерация файла и его скачивание
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students.xlsx";
    link.click();
  } catch (error) {
    alert("Ошибка при сохранении файла: " + error.message);
  }
}
