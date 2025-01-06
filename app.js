// Получение элементов DOM
const upload = document.getElementById("upload");
const downloadJsonBtn = document.getElementById("download-json");
const tableBody = document
  .getElementById("student-table")
  .querySelector("tbody");

// Преобразование Excel даты в формат YYYY-MM-DD
function parseExcelDate(excelDate) {
  if (typeof excelDate === "number") {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(
      date.d
    ).padStart(2, "0")}`;
  }
  return excelDate || ""; // Если значение не число, возвращаем его как есть
}

// Обновление таблицы в HTML
function updateTable(data) {
  tableBody.innerHTML = ""; // Очистка таблицы
  data.forEach((student, index) => {
    const row = document.createElement("tr");

    // Добавление ячеек
    const cells = [
      index + 1, // №
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
      student.curator || "", // Поле "Куратор", может быть пустым
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
      const students = jsonData.map((row) => ({
        name: row["ФИО"] || "",
        nameEn: row["ФИО (англ)"] || "",
        order: parseExcelDate(row["Приказ"]),
        orderDate: parseExcelDate(row["Дата приказа"]),
        birthYear: row["Год рождения"] || "",
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

      // Обработчик для кнопки "Скачать JSON"
      downloadJsonBtn.addEventListener("click", () => {
        if (students.length === 0) {
          alert("Нет данных для сохранения в JSON");
          return;
        }

        const blob = new Blob([JSON.stringify(students, null, 2)], {
          type: "application/json",
        });
        saveAs(blob, "students_data.json");
      });
    } catch (error) {
      alert("Ошибка при обработке файла: " + error.message);
    }
  };

  reader.readAsArrayBuffer(file);
});
