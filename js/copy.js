import {
  modal,
  modalDetails,
  closeButton,
  saveButton,
  // currentStudentData,
  // isEditing,
  tableBody,
  students,
  saveToFile,
  updateTable,
  checkPassword,
  // getFlagImage,
} from "./app.js";

// Получаем элементы для работы с модальным окном
// const modal = document.getElementById("modal");
// const modalDetails = document.getElementById("modal-details");
// const closeButton = document.getElementById("close-button");

let currentStudentData = {}; // Переменная для хранения данных текущего студента
let isEditing = false; // Флаг для редактирования
console.log("isEditing =", isEditing); // Вывод значения isEditing в консоль
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
  return countryCode ? https://flagcdn.com/w320/${countryCode}.png : "";
}
// Открытие модального окна при клике на ФИО
tableBody.addEventListener("click", (event) => {
  const cell = event.target;
  const row = cell.parentElement;

  if (cell.cellIndex === 1) {
    // Проверяем, что это ячейка с ФИО
    let studentData = students[row.rowIndex - 2]; // Получаем данные студента
    currentStudentData = { ...studentData }; // Создаем копию данных для редактирования
    showModal(studentData);
  }
});

// Функция для отображения модального окна с полной информацией
function showModal(studentData) {
  // saveButton.style.display = "none"; // Скрываем кнопку сохранения
  saveButton.style.display = isEditing ? "block" : "none";
  document.getElementById("print-button").style.display = "block";
  document.getElementById("edit-button").style.display = "block";
  document.getElementById("delete-button").style.display = "block";
  document.getElementById("close-button").style.display = "block";
  const country = studentData.country;
  const flagUrl = getFlagImage(country);

  modalDetails.innerHTML =
    `<div class="modal-details-item">
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
      <p><strong>Страна:</strong> <span contenteditable="false" class="editable" data-key="country">${country}</span>
      ${
        flagUrl
          ? <img src="${flagUrl}" alt="Flag" class="country-flag" />
          : ""
      }</p>
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
    </div>

<div class="modal-details-item">
<h3>Отсканированные документы</h3>
<div id="scan-controls-1">
  <button id="add-scan-button-scan1"><i class="fa fa-plus"></i></button>
  <button id="view-scan-button-scan1"><i class="fa fa-eye"></i></button>
  <button id="edit-scan-button-scan1" style="display: none;"><i class="fa fa-pen"></i></button>
  <button id="delete-scan-button-scan1" style="display: none;"><i class="fa fa-minus"></i></button>
  <span id="scan-file-name-scan1"></span>
</div>
<div id="scan-controls-2">
  <button id="add-scan-button-scan2" style="display: none;"><i class="fa fa-plus"></i></button>
  <button id="view-scan-button-scan2" ><i class="fa fa-eye"></i></button>
  <button id="edit-scan-button-scan2" style="display: none;"><i class="fa fa-pen"></i></button>
  <button id="delete-scan-button-scan2" style="display: none;"><i class="fa fa-minus"></i></button>
  <span id="scan-file-name-scan2"></span>
</div>

</div>`


  ;
  modal.style.display = "block"; // Показываем модальное окно
}

// Обработчик для кнопки печати
document.getElementById("print-button").addEventListener("click", () => {
  const printContents = modalDetails.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML =
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
  ;

  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // Перезагрузка страницы для восстановления содержимого
});

// Обработчик закрытия модального окна
function closeModal() {
  if (isEditing) {
    const confirmSave = confirm(
      "Вы внесли изменения. Сохранить их перед закрытием?"
    );
    if (confirmSave) {
      // Сохраняем изменения из полей
      const editableFields = document.querySelectorAll(".editable");
      editableFields.forEach((field) => {
        const key = field.dataset.key;
        currentStudentData[key] = field.textContent;
      });

      // Сохраняем сканы из localStorage
      const documentScan1 = localStorage.getItem("scan1");
      const documentScan2 = localStorage.getItem("scan2");

      if (documentScan1) currentStudentData.documentScan1 = documentScan1;
      if (documentScan2) currentStudentData.documentScan2 = documentScan2;

      // Сохранение изменений в массиве студентов
      const rowIndex = students.findIndex(
        (student) => student.name === currentStudentData.name
      );
      if (rowIndex !== -1) {
        students[rowIndex] = currentStudentData;
      } else {
        students.push(currentStudentData); // Добавляем нового студента, если его ещё нет
      }

      // Сохраняем данные в localStorage
      localStorage.setItem("studentsData", JSON.stringify(students));

      // Обновляем таблицу
      updateTable(students);

      // Сохраняем данные в файл JSON
      saveToFile(students, "students.json");
    } else {
      // Если пользователь отказался, откатываем изменения
      currentStudentData = null;
    }
  }

  modal.style.display = "none"; // Закрываем окно
  isEditing = false; // Сбрасываем флаг
}

// Закрытие модального окна через кнопку
closeButton.addEventListener("click", closeModal);

document.getElementById("edit-button").addEventListener("click", () => {
  checkPassword(() => {
    // Делаем поля редактируемыми
    const editableFields = document.querySelectorAll(".editable");
    editableFields.forEach((field) => {
      field.contentEditable = "true";
      field.classList.add("editing"); // Добавляем класс для подсветки
    });

    // Добавляем кнопки редактирования сканов
    // Настраиваем обработчики для первого и второго сканов
    setupScanHandlers("scan1");
    setupScanHandlers("scan2");

    isEditing = true; // Устанавливаем флаг изменений
    console.log("isEditing set to", isEditing); // Отладочный вывод
  });
});

// Обработчик для кнопки "Удалить"
document.getElementById("delete-button").addEventListener("click", () => {
  checkPassword(() => {
    const confirmDelete = confirm("Вы уверены, что хотите удалить эти данные?");
    if (confirmDelete) {
      // Удаляем текущего студента из массива
      const rowIndex = students.findIndex(
        (student) => student.name === currentStudentData.name
      );
      if (rowIndex !== -1) {
        students.splice(rowIndex, 1); // Удаляем из массива
        localStorage.setItem("studentsData", JSON.stringify(students)); // Обновляем localStorage
        updateTable(students); // Обновляем таблицу
        saveToFile(students, "students.json"); // Сохраняем данные в файл
        closeModal(); // Закрываем модальное окно
      }
    } else {
      alert("Удаление отменено.");
    }
  });
});

// кнопки для скана

// кнопки для скана

export function setupScanHandlers(scanKey) {
  const addButtonId = add-scan-button-${scanKey};
  const viewButtonId = view-scan-button-${scanKey};
  const editButtonId = edit-scan-button-${scanKey};
  const deleteButtonId = delete-scan-button-${scanKey};
  const fileNameContainerId = scan-file-name-${scanKey};

  // Добавляем обработчик на кнопку добавления скана
  document.getElementById(addButtonId).addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,application/pdf"; // Поддержка изображений и PDF

    // Ожидаем выбора файла
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0]; // Получаем файл

      if (file) {
        // Используем handleFileUpload для обработки загрузки файла
        handleFileUpload(scanKey, file);

        // Показываем кнопки
        document.getElementById(viewButtonId).style.display = "block";
        document.getElementById(editButtonId).style.display = "block";
        document.getElementById(deleteButtonId).style.display = "block";

        // Скрываем кнопку добавления
        document.getElementById(addButtonId).style.display = "none";

        // Показываем название файла рядом с кнопкой
        const fileNameContainer = document.getElementById(fileNameContainerId);
        fileNameContainer.textContent = file.name;
      }
    });

    // Открываем окно выбора файла
    fileInput.click();
  });

  // Реализация просмотра файла
  document.getElementById(viewButtonId).addEventListener("click", () => {
    const scanBase64 = localStorage.getItem(scanKey);
    if (scanBase64) {
      const newWindow = window.open();
      newWindow.document.write(
        <embed src="${scanBase64}" width="100%" height="100%">
      );
      newWindow.document.close();
    }
  });

  // Реализация редактирования
  document.getElementById(editButtonId).addEventListener("click", () => {
    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.accept = "image/*,application/pdf";

    newFileInput.addEventListener("change", (event) => {
      const newFile = event.target.files[0];
      if (newFile) {
        // Обновляем данные с помощью handleFileUpload
        handleFileUpload(scanKey, newFile);

        // Обновляем название файла
        const fileNameContainer = document.getElementById(fileNameContainerId);
        fileNameContainer.textContent = newFile.name;

        console.log(Скан ${scanKey} обновлён);
      }
    });

    // Открываем окно выбора файла
    newFileInput.click();
  });

  // Реализация удаления
  document.getElementById(deleteButtonId).addEventListener("click", () => {
    console.log(Удалить скан ${scanKey});
    localStorage.removeItem(scanKey);
    document.getElementById(viewButtonId).style.display = "none";
    document.getElementById(editButtonId).style.display = "none";
    document.getElementById(deleteButtonId).style.display = "none";
    document.getElementById(addButtonId).style.display = "block"; // Показываем кнопку добавления
    const fileNameContainer = document.getElementById(fileNameContainerId);
    fileNameContainer.textContent = ""; // Убираем название файла
  });
}

// Функция для обработки загрузки файла
function handleFileUpload(scanKey, file) {
  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result; // Преобразуем файл в Base64
    localStorage.setItem(scanKey, base64String); // Сохраняем Base64 в localStorage
    console.log(Файл сохранён в Base64 с ключом ${scanKey});
  };
  reader.readAsDataURL(file); // Читаем файл как Data URL
}

