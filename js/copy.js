// ******************** ИНИЦИАЛИЗАЦИЯ ********************

// Элементы DOM
const upload = document.getElementById("upload");
const downloadJsonBtn = document.getElementById("download-json");
const loadJsonBtn = document.getElementById("load-json");
const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");
const notification = document.getElementById("notification"); // Элемент для уведомления
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modal-details");
const closeButton = document.getElementById("close-button");

// Глобальные переменные
let students = []; // Массив для хранения данных студентов
let currentStudentData = null; // Данные текущего студента для модального окна
let isEditing = false; // Флаг режима редактирования

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
 * Получение URL изображения флага по названию страны
 * @param {string} country - Название страны
 * @returns {string} - URL изображения флага
 */
function getFlagImage(country) {
  const countryCodes = {
    Азербайджан: "az",
    "Арабская Республика Египет": "eg",
    Беларусь: "by",
    Венесуэла: "ve",
    Вьетнам: "vn",
    Гана: "gh",
    Зимбабве: "zw",
    Израиль: "il",
    Иордания: "jo",
    "Йеменская Республика": "ye",
    Казахстан: "kz",
    Китай: "cn",
    Нигерия: "ng",
    Россия: "ru",
    Сирия: "sy",
    Судан: "sd",
    Таджикистан: "tj",
    Туркменистан: "tm",
  };

  const countryCode = countryCodes[country];
  return countryCode ? `https://flagcdn.com/w320/${countryCode}.png` : "";
}

/**
 * Сохранение данных в файл JSON
 * @param {Array} data - Данные для сохранения
 * @param {string} filename - Имя файла
 */
function saveToFile(data, filename) {
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

// ******************** РАБОТА С ТАБЛИЦЕЙ ********************

/**
 * Обновление таблицы с данными студентов
 * @param {Array} data - Данные для отображения
 */
function updateTable(data) {
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
// Модальное окно
// Находим элементы модального окна

// Открытие модального окна при клике на ФИО
tableBody.addEventListener("click", (event) => {
  const cell = event.target;
  const row = cell.parentElement;

  if (cell.cellIndex === 1) {
    // Проверяем, что это ячейка с ФИО
    const studentData = students[row.rowIndex - 2]; // Получаем данные студента
    currentStudentData = { ...studentData }; // Создаем копию данных для редактирования
    showModal(studentData);
  }
});

// Функция для отображения модального окна с полной информацией
function showModal(studentData) {
  const country = studentData.country;
  const flagUrl = getFlagImage(country);

  modalDetails.innerHTML = `

  <div class="modal-details-item">
    <h3>Общие данные</h3>
    <p><strong>ФИО:</strong> <span contenteditable="false" class="editable" data-key="name">${
      studentData.name
    }</span></p>
    <p><strong>ФИО (англ):</strong> <span contenteditable="false" class="editable" data-key="nameEn">${
      studentData.nameEn
    }</span></p>
    <p><strong>Пол:</strong> <span contenteditable="false" class="editable" data-key="gender">${
      studentData.gender
    }</span></p>
    <p><strong>Год рождения:</strong> <span contenteditable="false" class="editable" data-key="birthYear">${
      studentData.birthYear
    }</span></p>
       <p><strong>Страна:</strong>
        <span contenteditable="false" class="editable" data-key="country">${country}</span>
        ${
          flagUrl
            ? `<img src="${flagUrl}" alt="Flag" class="country-flag" />`
            : ""
        }
      </p>
    </div>
  </div>
  <div class="modal-details-item">
    <h3>Образование</h3>
    <p><strong>Группа:</strong> <span contenteditable="false" class="editable" data-key="group">${
      studentData.group
    }</span></p>
    <p><strong>Факультет:</strong> <span contenteditable="false" class="editable" data-key="faculty">${
      studentData.faculty
    }</span></p>
    <p><strong>Курс:</strong> <span contenteditable="false" class="editable" data-key="course">${
      studentData.course
    }</span></p>
    <p><strong>Примечания:</strong> <span contenteditable="false" class="editable" data-key="note">${
      studentData.note
    }</span></p>
    <p><strong>Год поступления:</strong> <span contenteditable="false" class="editable" data-key="enrollmentYear">${
      studentData.enrollmentYear
    }</span></p>
    <p><strong>Год окончания:</strong> <span contenteditable="false" class="editable" data-key="graduationYear">${
      studentData.graduationYear
    }</span></p>
    <p><strong>Примечания:</strong> <span contenteditable="false" class="editable" data-key="note2">${
      studentData.note2
    }</span></p>
    <p><strong>Форма обучения:</strong> <span contenteditable="false" class="editable" data-key="educationForm">${
      studentData.educationForm
    }</span></p>
  </div>
  <div class="modal-details-item">
    <h3>Документы</h3>
    <p><strong>Серия и номер паспорта:</strong> <span contenteditable="false" class="editable" data-key="passport">${
      studentData.passport
    }</span></p>
    <p><strong>Приказ:</strong> <span contenteditable="false" class="editable" data-key="order">${
      studentData.order
    }</span></p>
    <p><strong>Дата приказа:</strong> <span contenteditable="false" class="editable" data-key="orderDate">${
      studentData.orderDate
    }</span></p>
  </div>
  <div class="modal-details-item">
    <h3>Контактные данные</h3>
    <p><strong>Адрес:</strong> <span contenteditable="false" class="editable" data-key="homeAddress">${
      studentData.homeAddress
    }</span></p>
    <p><strong>Общежитие/квартира:</strong> <span contenteditable="false" class="editable" data-key="dormOrApartment">${
      studentData.dormOrApartment
    }</span></p>
    <p><strong>Телефон студента:</strong> <span contenteditable="false" class="editable" data-key="phoneStudent">${
      studentData.phoneStudent
    }</span></p>
    <p><strong>Примечания:</strong> <span contenteditable="false" class="editable" data-key="note3">${
      studentData.note3
    }</span></p>
    <p><strong>Куратор:</strong> <span contenteditable="false" class="editable" data-key="curator">${
      studentData.curator
    }</span></p>
    <p><strong>Телефон куратора:</strong> <span contenteditable="false" class="editable" data-key="phoneCurator">${
      studentData.phoneCurator
    }</span></p>
  </div>
  <div class="modal-details-item">
    <h3>Разрешение на временное пребывание</h3>
    <p><span contenteditable="false" class="editable" data-key="residencePermission">${
      studentData.residencePermission
    }</span></p>
    <p><strong>с:</strong> <span contenteditable="false" class="editable" data-key="day1">${
      studentData.day1
    }</span> <span contenteditable="false" class="editable" data-key="month1">${
    studentData.month1
  }</span> <span contenteditable="false" class="editable" data-key="year1">${
    studentData.year1
  }</span></p>
    <p><strong>по:</strong> <span contenteditable="false" class="editable" data-key="day2">${
      studentData.day2
    }</span> <span contenteditable="false" class="editable" data-key="month2">${
    studentData.month2
  }</span> <span contenteditable="false" class="editable" data-key="year2">${
    studentData.year2
  }</span></p>
`;
  modal.style.display = "block"; // Показываем модальное окно
}

// Обработчик для кнопки печати
document.getElementById("print-button").addEventListener("click", () => {
  const printContents = modalDetails.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = `
    <html>
      <head>
        <title>Печать</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .modal-details-item { margin-bottom: 20px; }
          .modal-details-item h3 { font-size: 1.2rem; margin-bottom: 10px; }
          .modal-details-item p { margin: 5px 0; }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `;

  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // Перезагрузка страницы для восстановления содержимого
});

// ******************** ДОБАВИТЬ НОВОГО СТУДЕНТА ********************
// Слушатель на иконку добавления нового студента
document.querySelector(".fa-user-circle").addEventListener("click", () => {
  showModalForNewStudent();
});

// Функция для отображения модального окна для нового студента
function showModalForNewStudent() {
  currentStudentData = {}; // Новый объект для данных студента

  modalDetails.innerHTML = `

  <div class="modal-details-item">
    <h3>Общие данные</h3>
    <p><strong>ФИО:</strong> <span contenteditable="true" class="editable editing" data-key="name"></span></p>
    <p><strong>ФИО (англ):</strong> <span contenteditable="true" class="editable editing" data-key="nameEn"></span></p>
    <p><strong>Пол:</strong> <span contenteditable="true" class="editable editing" data-key="gender"></span></p>
    <p><strong>Год рождения:</strong> <span contenteditable="true" class="editable editing" data-key="birthYear"></span></p>
    <p><strong>Страна:</strong><span contenteditable="true" class="editable editing" data-key="country"></span></p>
    </div>
  </div>
  <div class="modal-details-item">
    <h3>Образование</h3>
    <p><strong>Группа:</strong> <span contenteditable="true" class="editable editing" data-key="group"></span></p>
    <p><strong>Факультет:</strong> <span contenteditable="true" class="editable editing" data-key="faculty"></span></p>
    <p><strong>Курс:</strong> <span contenteditable="true" class="editable editing" data-key="course"></span></p>
    <p><strong>Примечания:</strong> <span contenteditable="true" class="editable editing" data-key="note"></span></p>
    <p><strong>Год поступления:</strong> <span contenteditable="true" class="editable editing" data-key="enrollmentYear"></span></p>
    <p><strong>Год окончания:</strong> <span contenteditable="true" class="editable editing" data-key="graduationYear"></span></p>
    <p><strong>Примечания:</strong> <span contenteditable="true" class="editable editing" data-key="note2"></span></p>
    <p><strong>Форма обучения:</strong> <span contenteditable="true" class="editable editing" data-key="educationForm"></span></p>
  </div>
  <div class="modal-details-item">
    <h3>Документы</h3>
    <p><strong>Серия и номер паспорта:</strong> <span contenteditable="true" class="editable editing" data-key="passport"></span></p>
    <p><strong>Приказ:</strong> <span contenteditable="true" class="editable editing" data-key="order"></span></p>
    <p><strong>Дата приказа:</strong> <span contenteditable="true" class="editable editing" data-key="orderDate"></span></p>
  </div>
  <div class="modal-details-item">
    <h3>Контактные данные</h3>
    <p><strong>Адрес:</strong> <span contenteditable="true" class="editable editing" data-key="homeAddress"></span></p>
    <p><strong>Общежитие/квартира:</strong> <span contenteditable="true" class="editable editing" data-key="dormOrApartment"></span></p>
    <p><strong>Телефон студента:</strong> <span contenteditable="true" class="editable editing" data-key="phoneStudent"></span></p>
    <p><strong>Примечания:</strong> <span contenteditable="true" class="editable editing" data-key="note3"></span></p>
    <p><strong>Куратор:</strong> <span contenteditable="true" class="editable editing" data-key="curator"></span></p>
    <p><strong>Телефон куратора:</strong> <span contenteditable="true" class="editable editing" data-key="phoneCurator"></span></p>
  </div>
  <div class="modal-details-item">
    <h3>Разрешение на временное пребывание</h3>
    <p><span contenteditable="true" class="editable editing" data-key="residencePermission"></span></p>
    <p><strong>с: </strong> <span contenteditable="true" class="editable editing" data-key="day1">&nbsp;</span> <span contenteditable="true" class="editable editing" data-key="month1">&nbsp;</span><span contenteditable="true" class="editable editing" data-key="year1">&nbsp;</span></p>
    <p><strong>по: </strong> <span contenteditable="true" class="editable editing" data-key="day2">&nbsp;</span> <span contenteditable="true" class="editable editing" data-key="month2">&nbsp;</span><span contenteditable="true" class="editable editing" data-key="year2">&nbsp;</span></p>
`;

  modal.style.display = "block"; // Показываем модальное окно
  isEditing = true; // Устанавливаем флаг редактирования
}

// Обработчик закрытия модального окна
closeButton.addEventListener("click", () => {
  if (isEditing) {
    const confirmSave = confirm(
      "Вы внесли изменения. Сохранить нового студента перед закрытием?"
    );

    if (confirmSave) {
      // Сохраняем нового студента
      const editableFields = document.querySelectorAll(".editable");
      editableFields.forEach((field) => {
        const key = field.dataset.key;
        currentStudentData[key] = field.textContent.trim();
      });

      // Добавляем нового студента в массив и localStorage
      students.push(currentStudentData);
      localStorage.setItem("studentsData", JSON.stringify(students));
      updateTable(students);

      // Предлагаем сохранить файл
      saveToFile(students, "students.json");
    }
  }

  // Закрываем окно и сбрасываем состояние
  modal.style.display = "none";
  currentStudentData = null;
  isEditing = false;
});
