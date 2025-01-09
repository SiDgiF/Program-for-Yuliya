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
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modal-details");
const closeButton = document.querySelector(".close-button");

// Открытие модального окна при клике на ФИО
tableBody.addEventListener("click", (event) => {
  const cell = event.target;
  const row = cell.parentElement;

  if (cell.cellIndex === 1) {
    // Проверяем, что это ячейка с ФИО
    const studentData = students[row.rowIndex - 2]; // Получаем данные студента
    showModal(studentData);
  }
});

// Функция для отображения модального окна
// Функция для отображения модального окна с полной информацией
function showModal(studentData) {
  modalDetails.innerHTML = `
    <div class="modal-details-item">
      <h3>Общие данные</h3>
      <p><strong>ФИО:</strong> ${studentData.name}</p>
      <p><strong>ФИО (англ):</strong> ${studentData.nameEn}</p>
      <p><strong>Пол:</strong> ${studentData.gender}</p>
      <p><strong>Год рождения:</strong> ${studentData.birthYear}</p>
      <p><strong>Страна:</strong> ${studentData.country}</p>
    </div>
    <div class="modal-details-item">
      <h3>Образование</h3>
      <p><strong>Группа:</strong> ${studentData.group}</p>
      <p><strong>Факультет:</strong> ${studentData.faculty}</p>
      <p><strong>Курс:</strong> ${studentData.course}</p>
      <p><strong>Примечания:</strong> ${studentData.note}</p>
      <p><strong>Год поступления:</strong> ${studentData.enrollmentYear}</p>
      <p><strong>Год окончания:</strong> ${studentData.graduationYear}</p>
      <p><strong>Примечания:</strong> ${studentData.note2}</p>
      <p><strong>Форма обучения:</strong> ${studentData.educationForm}</p>
    </div>
    <div class="modal-details-item">
      <h3>Документы</h3>
      <p><strong>Серия и номер паспорта:</strong> ${studentData.passport}</p>
      <p><strong>Приказ:</strong> ${studentData.order}</p>
      <p><strong>Дата приказа:</strong> ${studentData.orderDate}</p>
    </div>
    <div class="modal-details-item">
      <h3>Контактные данные</h3>
      <p><strong>Адрес:</strong> ${studentData.homeAddress}</p>
      <p><strong>Общежитие/квартира:</strong> ${studentData.dormOrApartment}</p>
      <p><strong>Телефон студента:</strong> ${studentData.phoneStudent}</p>
      <p><strong>Примечания:</strong> ${studentData.note3}</p>
      <p><strong>Куратор:</strong> ${studentData.curator}</p>
      <p><strong>Телефон куратора:</strong> ${studentData.phoneCurator}</p>
    </div>
    <div class="modal-details-item">
      <h3>Разрешение на временное пребывание</h3>
      <p>${studentData.residencePermission}</p>
      <p><strong>с:</strong> ${studentData.day1} ${studentData.month1} ${studentData.year1}</p>
      <p><strong>с:</strong> ${studentData.day2} ${studentData.month2} ${studentData.year2}</p>
  `;
  modal.style.display = "block"; // Показываем модальное окно
}

// Закрытие модального окна
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Закрытие при клике вне модального окна
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Закрытие по нажатию ESC
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.style.display = "none";
  }
});
