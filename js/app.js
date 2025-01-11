// ******************** ИНИЦИАЛИЗАЦИЯ ********************

// Элементы DOM
export const upload = document.getElementById("upload");
export const downloadJsonBtn = document.getElementById("download-json");
export const loadJsonBtn = document.getElementById("load-json");
export const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");
export const notification = document.getElementById("notification"); // Элемент для уведомления
export const modal = document.getElementById("modal");
export const modalDetails = document.getElementById("modal-details");
export const closeButton = document.getElementById("close-button");
export const saveButton = document.getElementById("save-button");

// Глобальные переменные
export let students = []; // Массив для хранения данных студентов
export let currentStudentData = null; // Данные текущего студента для модального окна
export let isEditing = false; // Флаг режима редактирования

// ********************************ПОИСК*****************************
// Открытие/закрытие меню поиск
// Элемент строки поиска
const searchInput = document.getElementById("student-search");
// При клике на search-container показываем поле ввода
document
  .querySelector(".search-container")
  .addEventListener("click", (event) => {
    // Предотвращаем распространение события, чтобы не вызвать скрытие при клике внутри контейнера
    event.stopPropagation();

    const searchInputWrapper = document.querySelector(".search-input-wrapper");
    searchInputWrapper.style.display = "inline-block"; // Показываем поле ввода
  });

// Закрытие поля ввода при клике вне поля (на любом другом месте)
document.addEventListener("click", (event) => {
  const searchInputWrapper = document.querySelector(".search-input-wrapper");

  // Проверяем, был ли клик вне поля ввода
  const isClickInsideSearchInput = searchInputWrapper.contains(event.target);
  const isClickInsideSearchContainer = document
    .querySelector(".search-container")
    .contains(event.target);

  if (!isClickInsideSearchInput && !isClickInsideSearchContainer) {
    searchInputWrapper.style.display = "none"; // Скрываем поле ввода
  }
});

// Обработчик ввода в строку поиска
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(query)
  );
  updateTable(filteredStudents);
});

// ******************** УТИЛИТЫ ********************

/**
 * Преобразование даты Excel в формат DD.MM.YYYY
 * @param {number|string} excelDate - Дата из Excel
 * @returns {string} - Преобразованная дата
 */
function parseExcelDate(excelDate) {
  if (typeof excelDate === "number") {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return `${String(date.d).padStart(2, "0")}.${String(date.m).padStart(
      2,
      "0"
    )}.${date.y}`;
  }
  return excelDate || "";
}
/**
 * Сохранение данных в файл JSON
 * @param {Array} data - Данные для сохранения
 * @param {string} filename - Имя файла
 */
export function saveToFile(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Создаём функцию для проверки пароля
export function checkPassword(callback) {
  const password = prompt("Введите пароль:");
  if (password === "1234") {
    callback(); // Вызываем переданную функцию, если пароль верный
  } else {
    alert("Неверный пароль!");
  }
}

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

/**
 * Обновление таблицы с данными студентов
 * @param {Array} data - Данные для отображения
 */
export function updateTable(data) {
  tableBody.innerHTML = "";
  data.forEach((student, index) => {
    const row = document.createElement("tr");

    const cells = [
      index + 1,
      student.name,
      student.nameEn,
      student.order,
      student.orderDate,
      student.birthYear,
      student.country,
      student.gender,
      student.passport,
      student.group,
      student.faculty,
      student.course,
      student.note,
      student.educationForm,
      student.residencePermission,
      student.day1,
      student.month1,
      student.year1,
      student.day2,
      student.month2,
      student.year2,
      student.homeAddress,
      student.dormOrApartment,
      student.enrollmentYear,
      student.graduationYear,
      student.note2,
      student.curator,
      student.phoneCurator,
      student.phoneStudent,
      student.note3,
    ];

    cells.forEach((cellValue) => {
      const cell = document.createElement("td");
      cell.textContent = cellValue;
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}

// ******************** РАБОТА С ФАЙЛАМИ ********************

// Загрузка данных из Excel
upload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    alert("Выберите файл!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      students = jsonData.map((row) => ({
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
        note: row["Примечание 1"] || "",
        educationForm: row["Форма обучения"] || "",
        residencePermission: row["Разрешение на временное пребывание"] || "",
        day1: row["День 1"] || "",
        month1: row["Месяц 1"] || "",
        year1: row["Год 1"] || "",
        day2: row["День 2"] || "",
        month2: row["Месяц 2"] || "",
        year2: row["Год 2"] || "",
        homeAddress: row["Домашний адрес"] || "",
        dormOrApartment: row["Общежитие/квартира"] || "",
        enrollmentYear: row["Год поступления"] || "",
        graduationYear: row["Год окончания"] || "",
        note2: row["Примечание 2"] || "",
        curator: row["Куратор"] || "",
        phoneCurator: row["Телефон куратора"] || "",
        phoneStudent: row["Телефон студента"] || "",
        note3: row["Примечание 3"] || "",
      }));

      localStorage.setItem("studentsData", JSON.stringify(students));
      updateTable(students);
    } catch (error) {
      alert("Ошибка при обработке файла: " + error.message);
    }
  };

  reader.readAsArrayBuffer(file);
});

// Скачивание данных в JSON
downloadJsonBtn.addEventListener("click", () => {
  const studentsData = localStorage.getItem("studentsData");
  if (studentsData) {
    // Преобразование строки JSON в объект
    const studentsArray = JSON.parse(studentsData);

    // Преобразование обратно в JSON с отступами для читаемости
    const formattedJson = JSON.stringify(studentsArray, null, 2);

    // Создание Blob с типом "application/json"
    const blob = new Blob([formattedJson], { type: "application/json" });

    // Скачивание файла
    saveAs(blob, "students_data.json");
  } else {
    alert("Нет данных для сохранения!");
  }
});

// Загрузка данных из JSON
loadJsonBtn.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.click();

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("Выберите файл!");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        students = jsonData;

        // Сохраняем данные в localStorage, а не путь
        localStorage.setItem("studentsData", e.target.result);

        updateTable(students);
      } catch (error) {
        alert("Ошибка при обработке файла JSON: " + error.message);
      }
    };

    reader.readAsText(file);
  });
});

// Автоматическая загрузка данных при загрузке страницы, если данные сохранены
document.addEventListener("DOMContentLoaded", () => {
  const studentsData = localStorage.getItem("studentsData");

  if (studentsData) {
    students = JSON.parse(studentsData); // Восстановление данных
    updateTable(students); // Обновление таблицы
  } else {
    notification.style.display = "block"; // Показать уведомление, если данных нет
  }
});

// ******************** РАБОТА С МОДАЛЬНЫМИ ОКНАМИ ********************
// Открытие/закрытие бургер-меню
document.querySelector(".fa").addEventListener("click", () => {
  const menuContainer = document.querySelector(".menu-container");
  menuContainer.classList.toggle("active");
});

// Закрытие меню при клике вне области меню
document.addEventListener("click", (event) => {
  const menuContainer = document.querySelector(".menu-container");
  const isClickInside = menuContainer.contains(event.target);
  const isIconClick = event.target.closest(".fa");

  if (!isClickInside && !isIconClick) {
    menuContainer.classList.remove("active");
  }
});

// сортировка
