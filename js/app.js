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
        curator: row["Куратор"] || "",
        phoneCurator: row["Телефон куратора"] || "",
        phoneStudent: row["Телефон студента"] || "",
        note3: row["Примечание"] || "",
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

        // Сохраняем путь к выбранному файлу в localStorage
        const filePath = URL.createObjectURL(file);
        localStorage.setItem("jsonFilePath", filePath);

        updateTable(students);
      } catch (error) {
        alert("Ошибка при обработке файла JSON: " + error.message);
      }
    };

    reader.readAsText(file);
  });
});

// Автоматическая загрузка данных при загрузке страницы, если путь сохранен
document.addEventListener("DOMContentLoaded", () => {
  const jsonFilePath = localStorage.getItem("jsonFilePath");

  if (jsonFilePath) {
    // Если путь есть, загружаем данные
    loadDataFromFile(jsonFilePath);
  } else {
    // Если пути нет, показываем уведомление
    notification.style.display = "block";
  }
});

// Функция для загрузки данных из файла JSON
function loadDataFromFile(filePath) {
  fetch(filePath)
    .then((response) => response.json())
    .then((data) => {
      students = data; // Сохраняем данные
      updateTable(data); // Обновляем таблицу
    })
    .catch((error) => {
      alert("Ошибка при загрузке данных: " + error.message);
    });
}
