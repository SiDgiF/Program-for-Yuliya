// Получение элементов DOM
const upload = document.getElementById("upload");
const downloadJsonBtn = document.getElementById("download-json");
const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");
const sortCountryBtn = document.getElementById("sort-country-btn");
const countryFilter = document.getElementById("country-filter");
const studentModal = document.getElementById("studentModal");
const closeModalBtn = document.querySelector(".close");
const modalStudentDetails = document.getElementById("modal-student-details");

let students = [];

// Функция для преобразования даты Excel в формат YYYY-MM-DD
function parseExcelDate(excelDate) {
  if (typeof excelDate === "number") {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
      date.d
    ).padStart(2, "0")}`;
  }
  return excelDate || ""; // Если значение не число, возвращаем его как есть
}

// Функция для обновления таблицы
function updateTable(data) {
  tableBody.innerHTML = ""; // Очистка таблицы
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
      student.curator || "",
    ];

    cells.forEach((cellValue) => {
      const cell = document.createElement("td");
      cell.textContent = cellValue;
      row.appendChild(cell);
    });

    // Обработчик клика на строку для отображения модального окна
    row.addEventListener("click", () => {
      showModal(student);
    });

    tableBody.appendChild(row);
  });
}

// Функция для отображения данных в модальном окне
function showModal(student) {
  modalStudentDetails.innerHTML = `
    <p><strong>ФИО:</strong> ${student.name}</p>
    <p><strong>ФИО (англ):</strong> ${student.nameEn}</p>
    <p><strong>Приказ:</strong> ${student.order}</p>
    <p><strong>Дата приказа:</strong> ${student.orderDate}</p>
    <p><strong>Год рождения:</strong> ${student.birthYear}</p>
    <p><strong>Страна:</strong> ${student.country}</p>
    <p><strong>Пол:</strong> ${student.gender}</p>
    <p><strong>Серия и номер паспорта:</strong> ${student.passport}</p>
    <p><strong>Группа:</strong> ${student.group}</p>
    <p><strong>Факультет:</strong> ${student.faculty}</p>
    <p><strong>Курс:</strong> ${student.course}</p>
    <p><strong>Примечание:</strong> ${student.note}</p>
    <p><strong>Форма обучения:</strong> ${student.educationForm}</p>
    <p><strong>Разрешение на временное пребывание:</strong> ${student.residencePermission}</p>
    <p><strong>День 1:</strong> ${student.day1}</p>
    <p><strong>Месяц 1:</strong> ${student.month1}</p>
    <p><strong>Год 1:</strong> ${student.year1}</p>
    <p><strong>День 2:</strong> ${student.day2}</p>
    <p><strong>Месяц 2:</strong> ${student.month2}</p>
    <p><strong>Год 2:</strong> ${student.year2}</p>
    <p><strong>Домашний адрес:</strong> ${student.homeAddress}</p>
    <p><strong>Общежитие/квартира:</strong> ${student.dormOrApartment}</p>
    <p><strong>Год поступления:</strong> ${student.enrollmentYear}</p>
    <p><strong>Год окончания:</strong> ${student.graduationYear}</p>
    <p><strong>Куратор:</strong> ${student.curator}</p>
  `;

  studentModal.style.display = "block";
}

// Закрытие модального окна
closeModalBtn.addEventListener("click", () => {
  studentModal.style.display = "none";
});

// Закрытие модального окна при нажатии клавиши Esc
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    studentModal.style.display = "none";
  }
});

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
      console.log("Raw data from Excel:", jsonData);

      // Преобразование данных в формат объектов
      students = jsonData.map((row) => ({
        name: row["ФИО"] || "",
        nameEn: row["ФИО (англ)"] || "",
        order: parseExcelDate(row["Приказ"]),
        orderDate: parseExcelDate(row["Дата приказа"]),
        birthYear: parseExcelDate(row["Год рождения"]),
        country: row["Страна"] || "",
        gender: row["Пол"] || "",
        passport: row["Серия и номер паспорта"] || "",
        group: row["Группа"] || "",
        faculty: row["Факультет"] || "",
        course: row["Курс"] || "",
        note: row["Примечание"] || "",
        educationForm: row["Форма обучения"] || "",
        residencePermission: row["Разрешение на временное пребывание"] || "",
        day1: row["День"] || "",
        month1: row["Месяц"] || "",
        year1: row["Год"] || "",
        day2: row["День"] || "",
        month2: row["Месяц"] || "",
        year2: row["Год"] || "",
        homeAddress: row["Домашний адрес"] || "",
        dormOrApartment: row["Общежитие/квартира"] || "",
        enrollmentYear: row["Год поступления"] || "",
        graduationYear: row["Год окончания"] || "",
        curator: row["Куратор"] || "", // Новый столбец
      }));

      console.log("Преобразованные данные:", students);

      // Обновление таблицы на экране
      updateTable(students);
    } catch (error) {
      alert("Ошибка при обработке файла: " + error.message);
    }
  };

  reader.readAsArrayBuffer(file);
});
