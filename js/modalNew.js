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
      <p><strong>ФИО:</strong> <span contenteditable="true" class="editable" data-key="name"></span></p>
      <p><strong>ФИО (англ):</strong> <span contenteditable="true" class="editable" data-key="nameEn"></span></p>
      <p><strong>Пол:</strong> <span contenteditable="true" class="editable" data-key="gender"></span></p>
      <p><strong>Год рождения:</strong> <span contenteditable="true" class="editable" data-key="birthYear"></span></p>
      <p><strong>Страна:</strong> <span contenteditable="true" class="editable" data-key="country"></span></p>
    </div>
    <div class="modal-details-item">
      <h3>Образование</h3>
      <p><strong>Группа:</strong> <span contenteditable="true" class="editable" data-key="group"></span></p>
      <p><strong>Факультет:</strong> <span contenteditable="true" class="editable" data-key="faculty"></span></p>
      <p><strong>Курс:</strong> <span contenteditable="true" class="editable" data-key="course"></span></p>
    </div>
    <div class="modal-details-item">
      <h3>Контактные данные</h3>
      <p><strong>Телефон студента:</strong> <span contenteditable="true" class="editable" data-key="phoneStudent"></span></p>
      <p><strong>Куратор:</strong> <span contenteditable="true" class="editable" data-key="curator"></span></p>
      <p><strong>Телефон куратора:</strong> <span contenteditable="true" class="editable" data-key="phoneCurator"></span></p>
    </div>
  `;

  modal.style.display = "block"; // Показываем модальное окно

  // Обработчик для кнопки "Сохранить"
  saveButton.addEventListener("click", () => {
    const newStudentData = {};
    const editableFields = document.querySelectorAll(".editable");
    editableFields.forEach((field) => {
      newStudentData[field.dataset.key] = field.textContent.trim();
    });

    // Добавляем нового студента в список
    students.push(newStudentData);
    localStorage.setItem("studentsData", JSON.stringify(students)); // Обновляем localStorage
    updateTable(students); // Обновляем таблицу
    saveToFile(students, "students.json"); // Сохраняем данные в файл

    closeModal(); // Закрываем модальное окно
  });
}

// Обработчик для закрытия модального окна
function closeModal() {
  modal.style.display = "none"; // Закрываем окно
}

// Слушатель на иконку добавления нового студента
document.querySelector(".fa-user-circle").addEventListener("click", () => {
  checkPassword(() => {
    showModalForNewStudent();
  });
});

// Закрытие модального окна через кнопку
closeButton.addEventListener("click", closeModal);
