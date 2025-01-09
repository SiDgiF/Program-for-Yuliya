const upload = document.getElementById("upload");
const downloadJsonBtn = document.getElementById("download-json");
const loadJsonBtn = document.getElementById("load-json");
const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");
const notification = document.getElementById("notification"); // Элемент для уведомления

let students = [];

// Функция для преобразования даты Excel в формат DD.MM.YYYY
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

// Функция для обновления таблицы
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

// Обработчик загрузки файла
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

      // Преобразование Excel в JSON
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

      // Сохраняем данные в localStorage
      localStorage.setItem("studentsData", JSON.stringify(students));

      // Обновление таблицы на экране
      updateTable(students);
    } catch (error) {
      alert("Ошибка при обработке файла: " + error.message);
    }
  };

  reader.readAsArrayBuffer(file);
});

// Сохранение данных в JSON
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

// ********** Бургер

// Открытие/закрытие бургер-меню
document.querySelector(".settings-icon").addEventListener("click", () => {
  const menuContainer = document.querySelector(".menu-container");
  menuContainer.classList.toggle("active");
});

// Закрытие меню при клике вне области меню
document.addEventListener("click", (event) => {
  const menuContainer = document.querySelector(".menu-container");
  const isClickInside = menuContainer.contains(event.target);
  const isIconClick = event.target.closest(".settings-icon");

  if (!isClickInside && !isIconClick) {
    menuContainer.classList.remove("active");
  }
});
// Модальное окно
// Находим элементы модального окна
// Модальное окно
// Находим элементы модального окна
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modal-details");
const closeButton = document.getElementById("close-button");

let currentStudentData = null; // Глобальная переменная для хранения данных текущего студента
let isEditing = false; // Флаг, указывающий на режим редактирования

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

// Функция для отображения модального окна

// Функция для получения URL изображения флага
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

function getFlagImage(country) {
  const countryCode = countryCodes[country]; // Ищем код страны
  if (!countryCode) {
    console.warn(`Код для страны "${country}" не найден.`);
    return ""; // Возвращаем пустую строку, если код не найден
  }
  return `https://flagcdn.com/w320/${countryCode}.png`; // URL флага
}

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

  // Обновлённый обработчик "Редактировать"
  document.getElementById("edit-button").addEventListener("click", () => {
    const password = prompt("Введите пароль для редактирования:");
    if (password === "1234") {
      const editableFields = document.querySelectorAll(".editable");
      editableFields.forEach((field) => {
        field.contentEditable = "true";
      });
      isEditing = true; // Устанавливаем флаг изменений
    } else {
      alert("Неверный пароль!");
    }
  });

  // Обработчик закрытия модального окна
  function closeModal() {
    if (isEditing) {
      const confirmSave = confirm(
        "Вы внесли изменения. Сохранить их перед закрытием?"
      );
      if (confirmSave) {
        // Сохраняем изменения
        const editableFields = document.querySelectorAll(".editable");
        editableFields.forEach((field) => {
          const key = field.dataset.key;
          currentStudentData[key] = field.textContent;
        });

        // Сохранение изменений в массиве и localStorage
        const rowIndex = students.findIndex(
          (student) => student.name === currentStudentData.name
        );
        if (rowIndex !== -1) {
          students[rowIndex] = currentStudentData;
          localStorage.setItem("studentsData", JSON.stringify(students));
          updateTable(students);

          // Предлагаем сохранить файл на локальный диск
          saveToFile(students, "students.json");
        }
      } else {
        // Если пользователь отказался, откатываем изменения
        currentStudentData = null; // Сбрасываем изменения
      }
    }
    modal.style.display = "none"; // Закрываем окно
    isEditing = false; // Сбрасываем флаг
  }

  // Функция для сохранения JSON-файла на локальный диск
  function saveToFile(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2); // Преобразуем данные в формат JSON
    const blob = new Blob([jsonStr], { type: "application/json" }); // Создаем Blob-объект
    const url = URL.createObjectURL(blob); // Создаем URL для Blob

    const a = document.createElement("a"); // Создаем временную ссылку
    a.href = url;
    a.download = filename; // Устанавливаем имя файла
    document.body.appendChild(a); // Добавляем ссылку в DOM
    a.click(); // "Кликаем" по ссылке для скачивания
    document.body.removeChild(a); // Удаляем ссылку из DOM
    URL.revokeObjectURL(url); // Освобождаем память
  }

  // Закрытие модального окна через кнопку
  closeButton.addEventListener("click", closeModal);

  // Закрытие модального окна при клике вне окна
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
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
