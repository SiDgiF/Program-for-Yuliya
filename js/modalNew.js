// Импортируем необходимые переменные и функции из app.js
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

// ******************** ДОБАВИТЬ НОВОГО СТУДЕНТА ********************
// Слушатель на иконку добавления нового студента

document.querySelector(".fa-user-circle").addEventListener("click", () => {
  checkPassword(() => {
    showModalForNewStudent();
  });
});

function showModalForNewStudent() {
  // Показ кнопки сохранения
  saveButton.style.display = "block";
  document.getElementById("print-button").style.display = "none";
  document.getElementById("edit-button").style.display = "none";
  document.getElementById("delete-button").style.display = "none";
  document.getElementById("close-button").style.display = "none";

  // Создаем пустые поля для нового студента
  const emptyStudentData = {
    name: "",
    nameEn: "",
    gender: "",
    birthYear: "",
    country: "",
    group: "",
    faculty: "",
    course: "",
    note: "",
    enrollmentYear: "",
    graduationYear: "",
    note2: "",
    educationForm: "",
    passport: "",
    order: "",
    orderDate: "",
    homeAddress: "",
    dormOrApartment: "",
    phoneStudent: "",
    note3: "",
    curator: "",
    phoneCurator: "",
    residencePermission: "",
    day1: "",
    month1: "",
    year1: "",
    day2: "",
    month2: "",
    year2: "",
    documentScan: "", // ! Новое поле для скана документа
    documentScan2: "", // ! Новое поле для скана документа
  };

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
    </div>
 <div class="modal-details-item">
      <h3>Документы</h3>
      <p><strong>Скан документа 1:</strong></p>
      <input type="file" id="document-scan-1" accept="application/pdf,image/*">
      <button id="view-scan-button-1" style="display: none;">Посмотреть скан 1</button>
      <button id="delete-scan-button-1" style="display: none;">Удалить скан 1</button>
      <p><strong>Скан документа 2:</strong></p>
      <input type="file" id="document-scan-2" accept="application/pdf,image/*">
      <button id="view-scan-button-2" style="display: none;">Посмотреть скан 2</button>
      <button id="delete-scan-button-2" style="display: none;">Удалить скан 2</button>
    </div>
`;

  document.querySelectorAll(".editable.editing").forEach((el) => {
    el.style.backgroundColor = "#f0f0f0";
  });

  const fileInput1 = document.getElementById("document-scan-1");
  const fileInput2 = document.getElementById("document-scan-2");
  const viewButton1 = document.getElementById("view-scan-button-1");
  const viewButton2 = document.getElementById("view-scan-button-2");
  const deleteButton1 = document.getElementById("delete-scan-button-1");
  const deleteButton2 = document.getElementById("delete-scan-button-2");

  fileInput1.addEventListener("change", () => {
    if (fileInput1.files.length > 0) {
      const file = fileInput1.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        emptyStudentData.documentScan1 = e.target.result; // Сохраняем первый скан
        viewButton1.style.display = "block";
        deleteButton1.style.display = "block";

        viewButton1.onclick = function () {
          const win = window.open();
          win.document.write(
            '<iframe src="' +
              e.target.result +
              '" frameborder="0" style="width:100%;height:100%;"></iframe>'
          );
        };

        deleteButton1.onclick = function () {
          emptyStudentData.documentScan1 = ""; // Удаляем первый скан
          fileInput1.value = ""; // Сбрасываем поле загрузки
          viewButton1.style.display = "none";
          deleteButton1.style.display = "none";
        };
      };

      reader.readAsDataURL(file);
    }
  });

  fileInput2.addEventListener("change", () => {
    if (fileInput2.files.length > 0) {
      const file = fileInput2.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        emptyStudentData.documentScan2 = e.target.result; // Сохраняем второй скан
        viewButton2.style.display = "block";
        deleteButton2.style.display = "block";

        viewButton2.onclick = function () {
          const win = window.open();
          win.document.write(
            '<iframe src="' +
              e.target.result +
              '" frameborder="0" style="width:100%;height:100%;"></iframe>'
          );
        };

        deleteButton2.onclick = function () {
          emptyStudentData.documentScan2 = ""; // Удаляем второй скан
          fileInput2.value = ""; // Сбрасываем поле загрузки
          viewButton2.style.display = "none";
          deleteButton2.style.display = "none";
        };
      };

      reader.readAsDataURL(file);
    }
  });

  modal.style.display = "block";

  saveButton.onclick = function () {
    const confirmSave = confirm("Сохранить данные по новому студенту?");

    if (confirmSave) {
      const newStudent = {};

      document.querySelectorAll(".editable").forEach((el) => {
        const key = el.getAttribute("data-key");
        const value = el.innerText.trim();
        newStudent[key] = value;
      });

      newStudent.documentScan1 = emptyStudentData.documentScan1; // Добавляем первый скан
      newStudent.documentScan2 = emptyStudentData.documentScan2; // Добавляем второй скан

      const students = JSON.parse(localStorage.getItem("studentsData")) || [];
      students.push(newStudent);
      localStorage.setItem("studentsData", JSON.stringify(students));

      updateTable(students);
      saveToFile(students, "students.json");
      modal.style.display = "none";
      alert("Данные успешно сохранены!");
    } else {
      alert("Сохранение отменено.");
      modal.style.display = "none";
    }
  };
}
