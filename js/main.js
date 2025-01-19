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

document.addEventListener("DOMContentLoaded", () => {
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
    // Функция для скачивания в XLSX
    // downloadXlsxButton.addEventListener("click", async () => {
    //  код
    // });
  });
});

// Автозагрузка данных при запуске
document.addEventListener("DOMContentLoaded", async () => {
  students = await loadStudents();
  if (students.length) {
    updateTable(students);
  } else {
    notification.style.display = "block";
  }
});
