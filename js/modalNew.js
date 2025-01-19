// Импортируем необходимые переменные и функции из app.js
import {
  modal,
  modalDetails,
  closeButton,
  saveButton,
  tableBody,
  students,
  saveToFile,
  updateTable,
  checkPassword,
} from "./app.js";
import { setupScanHandlers, updateScanButtons } from "./scan.js";
import { closeModal } from "./modal.js";
// let currentStudentData = {}; // Переменная для хранения данных текущего студента
// Функция для отображения модального окна для создания нового студента
function showModalForNewStudent() {
  saveButton.style.display = "block";
  document.getElementById("print-button").style.display = "none";
  document.getElementById("edit-button").style.display = "none";
  document.getElementById("delete-button").style.display = "none";
  document.getElementById("close-button").style.display = "block";

  modalDetails.innerHTML = `
  <div class="modal-details-item">
    <h3>Общие данные</h3>
    <p><strong>ФИО:</strong> <span contenteditable="true" class="editable editing" data-key="name"></span></p>
    <p><strong>Пол:</strong> <span contenteditable="true" class="editable editing" data-key="gender"></span></p>
    <p><strong>Год рождения:</strong> <span contenteditable="true" class="editable editing" data-key="birthYear"></span></p>
    <p><strong>Страна:</strong> <span contenteditable="true" class="editable editing" data-key="country"></span></p>
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
    <p><strong>с:</strong> <span contenteditable="true" class="editable editing" data-key="day1"></span> <span contenteditable="true" class="editable editing" data-key="month1"></span> <span contenteditable="true" class="editable editing" data-key="year1"></span></p>
    <p><strong>по:</strong> <span contenteditable="true" class="editable editing" data-key="day2"></span> <span contenteditable="true" class="editable editing" data-key="month2"></span> <span contenteditable="true" class="editable editing" data-key="year2"></span></p>
  </div>

<div class="modal-details-item">
<h3>Отсканированные документы</h3>
<div id="scan-controls-1">
<button id="add-scan-button-scan1"><i class="fa fa-plus"></i></button>
<button id="view-scan-button-scan1"><i class="fa fa-eye" style="display: none;"></i></button>
<button id="delete-scan-button-scan1" style="display: none;"><i class="fa fa-minus"></i></button>
<span id="scan-file-name-scan1"></span>
</div>
<div id="scan-controls-2">
<button id="add-scan-button-scan2" ><i class="fa fa-plus"></i></button>
<button id="view-scan-button-scan2"><i class="fa fa-eye" style="display: none;"></i></button>
<button id="delete-scan-button-scan2" style="display: none;"><i class="fa fa-minus"></i></button>
<span id="scan-file-name-scan2"></span>
</div>

</div>
`;

  modal.style.display = "block"; // Показываем модальное окно

  setupScanHandlers("scan1", students);
  setupScanHandlers("scan2", students);

  // Обработчик для кнопки "Сохранить"
  saveButton.addEventListener("click", () => {
    const currentStudentData = {};
    const editableFields = document.querySelectorAll(".editable");
    editableFields.forEach((field) => {
      currentStudentData[field.dataset.key] = field.textContent.trim();
    });

    // Добавляем данные сканов в объект студента
    ["scan1", "scan2"].forEach((scanKey) => {
      const scanData = localStorage.getItem(scanKey); // Получаем данные скана из localStorage
      currentStudentData[scanKey] = scanData || null; // Добавляем их в объект студента
      localStorage.removeItem(scanKey); // Удаляем данные скана из localStorage
    });

    // Добавляем нового студента в список
    students.push(currentStudentData);
    localStorage.setItem("studentsData", JSON.stringify(students)); // Обновляем localStorage
    updateTable(students); // Обновляем таблицу
    saveToFile(students, "students.json"); // Сохраняем данные в файл

    closeModal(); // Закрываем модальное окно
  });
}

// Слушатель на иконку добавления нового студента
document.querySelector(".fa-user-circle").addEventListener("click", () => {
  checkPassword(() => {
    showModalForNewStudent();
  });
});

// Закрытие модального окна через кнопку
closeButton.addEventListener("click", closeModal);
