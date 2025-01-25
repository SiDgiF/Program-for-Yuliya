import { saveStudents, loadStudents } from "./indexedDB.js";
import { saveToFile, parseExcelDate, readFileAsText } from "./utils.js";

// Элементы DOM
const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");
const notification = document.getElementById("notification");

let students = [];

// ******************** РАБОТА С ТАБЛИЦЕЙ ********************
// Открытие/закрытие бургер-меню
document.querySelector(".fa-cogs").addEventListener("click", (event) => {
  event.stopPropagation(); // Останавливаем всплытие события
  const menuContainer = document.querySelector(".menu-container");
  menuContainer.classList.toggle("active");
});

// Закрытие меню при клике вне области меню
document.addEventListener("click", (event) => {
  const menuContainer = document.querySelector(".menu-container");
  const isClickInside = menuContainer.contains(event.target);
  const isCogsClick = event.target.closest(".fa-cogs"); // Проверяем только на иконку шестеренки

  if (!isClickInside && !isCogsClick) {
    menuContainer.classList.remove("active");
  }
});

// Обновление таблицы
export function updateTable(data) {
  tableBody.innerHTML = "";
  data.forEach((student, index) => {
    const row = document.createElement("tr");
    const cells = Object.values(student).map((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      return cell;
    });

    cells.forEach((cell) => row.appendChild(cell));
    tableBody.appendChild(row);
  });
}

// РАБОТА С ДАННЫМИ
// Автозагрузка данных при запуске и обработка событий на кнопки
document.addEventListener("DOMContentLoaded", async () => {
  // Загружаем данные студентов
  students = await loadStudents();
  if (students.length) {
    updateTable(students);
  } else {
    notification.style.display = "block";
  }

  // Получаем элементы кнопок и input
  const uploadButton = document.getElementById("upload-xlsx");
  const uploadInput = document.getElementById("upload");
  const downloadJsonButton = document.getElementById("download-json");
  const loadJsonButton = document.getElementById("load-json");
  const downloadXlsxButton = document.getElementById("download-xlsx-file");

  // Проверяем, если элементы не найдены, выводим ошибку
  if (!uploadButton || !uploadInput) {
    console.error("Не удалось найти элементы кнопки или input!");
    return;
  }

  // Функция для обработки выбора файла
  uploadButton.addEventListener("click", () => {
    // Открываем диалоговое окно выбора файла
    uploadInput.click();
  });

  // Слушаем нажатие кнопки для загрузки из excel
  uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files[0]; // Получаем выбранный файл
    if (!file) {
      alert("Выберите файл!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Чтение файла как массива байт
        const data = new Uint8Array(e.target.result);
        // Чтение книги Excel
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]; // Первая вкладка

        // Преобразование данных из Excel в формат JSON, начиная с 3-й строки
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { range: 2 }); // range: 3 - начиная с 4-й строки

        // Преобразование данных из Excel в формат, который нам нужен
        const students = jsonData.map((row) => ({
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
        }));

        // Сохранение данных в хранилище и обновление таблицы
        await saveStudents(students); // Функция сохранения данных в IndexedDB или другой источник
        updateTable(students); // Функция для обновления таблицы на экране
      } catch (error) {
        alert("Ошибка при обработке файла: " + error.message);
      }
    };

    // Чтение выбранного файла как массива байт
    reader.readAsArrayBuffer(file);
  });

  // Слушаем нажатие кнопки для сохранения в JSON
  downloadJsonButton.addEventListener("click", async () => {
    const studentsData = await loadStudents();
    if (studentsData.length) {
      saveToFile(studentsData, "students_data.json");
      // alert("Сохранение данных в JSON");
    } else {
      alert("Нет данных для сохранения!");
    }
  });

  // Слушаем нажатие кнопки для загрузки из JSON
  loadJsonButton.addEventListener("click", async () => {
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
        // alert("Загрузка данных из JSON");
      } catch (error) {
        alert("Ошибка при обработке файла JSON: " + error.message);
      }
    });
  });

  // ! Функция для скачивания в XLSX
  downloadXlsxButton.addEventListener("click", async () => {
    try {
      const studentsData = await loadStudents(); // Загружаем данные (из IndexedDB или другого источника)

      if (!studentsData.length) {
        alert("Нет данных для сохранения!");
        return;
      }

      // Получаем таблицу из DOM
      const table = document.querySelector("table"); // Убедитесь, что у таблицы есть селектор
      if (!table) {
        alert("Таблица не найдена!");
        return;
      }

      // Извлекаем ширину столбцов
      const columnWidths = Array.from(table.querySelectorAll("th")).map(
        (th) => {
          return th.offsetWidth / 7; // Делим на 7, чтобы Excel лучше подстроил ширину
        }
      );

      // Извлекаем высоту строк
      const rowHeights = Array.from(table.querySelectorAll("tr")).map((tr) => {
        return tr.offsetHeight / 1.5; // Коэффициент подбора для Excel
      });

      // Создаём книгу Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Students");

      // Устанавливаем столбцы с шириной
      const columns = [
        { header: "№", key: "number", width: columnWidths[0] || 5 },
        { header: "ФИО", key: "name", width: columnWidths[1] || 15 },
        { header: "ФИО (англ)", key: "nameEn", width: columnWidths[2] || 15 },
        { header: "Приказ", key: "order", width: columnWidths[3] || 15 },
        {
          header: "Дата приказа",
          key: "orderDate",
          width: columnWidths[4] || 15,
        },
        {
          header: "Год рождения",
          key: "birthYear",
          width: columnWidths[5] || 15,
        },
        { header: "Страна", key: "country", width: columnWidths[6] || 20 },
        { header: "Пол", key: "gender", width: columnWidths[7] || 10 },
        {
          header: "Серия и номер паспорта, дата выдачи, срок действия",
          key: "passport",
          width: columnWidths[8] || 30,
        },
        { header: "Группа", key: "group", width: columnWidths[9] || 15 },
        { header: "Факультет", key: "faculty", width: columnWidths[10] || 25 },
        { header: "Курс", key: "course", width: columnWidths[11] || 10 },
        { header: "Примечание*", key: "note", width: columnWidths[12] || 30 },
        {
          header: "Форма обучения",
          key: "educationForm",
          width: columnWidths[13] || 20,
        },
        {
          header: "Разрешение на временное пребывание",
          key: "residencePermission",
          width: columnWidths[14] || 25,
        },
        { header: "День", key: "day1", width: columnWidths[15] || 10 },
        { header: "Месяц", key: "month1", width: columnWidths[16] || 10 },
        { header: "Год", key: "year1", width: columnWidths[17] || 10 },
        { header: "День_", key: "day2", width: columnWidths[18] || 10 },
        { header: "Месяц_", key: "month2", width: columnWidths[19] || 10 },
        { header: "Год_", key: "year2", width: columnWidths[20] || 10 },
        {
          header: "Домашний адрес",
          key: "homeAddress",
          width: columnWidths[21] || 40,
        },
        {
          header: "Общежитие/квартира",
          key: "dormOrApartment",
          width: columnWidths[22] || 20,
        },
        {
          header: "Год поступления",
          key: "enrollmentYear",
          width: columnWidths[23] || 15,
        },
        {
          header: "Год окончания",
          key: "graduationYear",
          width: columnWidths[24] || 15,
        },
        { header: "Примечание**", key: "note2", width: columnWidths[25] || 15 },
        { header: "Куратор", key: "curator", width: columnWidths[26] || 20 },
        {
          header: "Телефон куратора",
          key: "phoneCurator",
          width: columnWidths[27] || 20,
        },
        {
          header: "Телефон студента",
          key: "phoneStudent",
          width: columnWidths[28] || 20,
        },
        {
          header: "Примечание***",
          key: "note3",
          width: columnWidths[29] || 15,
        },
      ];

      sheet.columns = columns; // Устанавливаем столбцы

      // Добавляем первую строку шапки через headerRow.values
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
      ];

      // Добавляем вторую строку с основными заголовками
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

      // Устанавливаем стиль для второй строки (основная шапка)
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
      });

      // Устанавливаем высоту строки с основными заголовками
      sheet.getRow(2).height = rowHeights[0] || 30; // Высота заголовка

      // Добавляем данные студентов
      studentsData.forEach((student, index) => {
        const row = sheet.addRow(student);
        row.height = rowHeights[index + 1] || 20; // Устанавливаем высоту строки

        // Настроим выравнивание текста для всех ячеек
        row.eachCell((cell) => {
          cell.alignment = {
            wrapText: true,
            vertical: "middle",
            horizontal: "left",
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
  });
});
