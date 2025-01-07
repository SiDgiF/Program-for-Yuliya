// Получение элементов DOM
const upload = document.getElementById("upload");
const downloadJsonBtn = document.getElementById("download-json");
const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");
const sortCountryBtn = document.getElementById("sort-country-btn");
const countryFilter = document.getElementById("country-filter");

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
        passport: String(
          row["Серия и номер паспорта, дата выдачи, срок действия"] || ""
        ), // Преобразование в строку
        // Проверьте формат ячейки в Excel. Убедитесь, что она установлена как "Текстовый", а не "Общий" или "Дата".
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
        note2: row["Примечание"] || "",
        curator: row["Куратор"] || "", // Новый столбец
        phoneCurator: row["Телефон куратора"] || "",
        phoneStudent: row["Телефон студента"] || "",
        note3: row["Примечание"] || "",
      }));

      console.log("Преобразованные данные:", students);
      console.log(
        "Данные паспорта:",
        students.map((s) => s.passport)
      );
      // Обновление таблицы на экране
      updateTable(students);
    } catch (error) {
      alert("Ошибка при обработке файла: " + error.message);
    }
  };

  reader.readAsArrayBuffer(file);
});

// start* Автоматическая ширина на основе содержимого
// function adjustColumnWidths(tableId) {
//   const table = document.getElementById(tableId);
//   const headerCells = table.querySelectorAll("thead th");

//   headerCells.forEach((headerCell, index) => {
//     let maxWidth = headerCell.offsetWidth; // Начинаем с ширины заголовка

//     // Проходим по всем строкам таблицы
//     table.querySelectorAll("tbody tr").forEach((row) => {
//       const cell = row.cells[index];
//       if (cell) {
//         maxWidth = Math.max(maxWidth, cell.scrollWidth);
//       }
//     });

//     // Устанавливаем максимальную ширину для текущего столбца
//     headerCell.style.width = `${maxWidth}px`;
//   });
// }

// // Вызываем функцию после добавления данных
// updateTable(students); // Ваша функция для обновления таблицы
// adjustColumnWidths("student-table");

// end* Автоматическая ширина на основе содержимого
