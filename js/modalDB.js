import { tableBody, updateTable, students } from "./main.js";
import { checkPassword } from "./utils.js";
import { setupPrintButton } from "./modalDB_elements.js";
import { getFlagImage } from "./modalDB_elements.js";
import { setupScanHandlers, updateScanButtons } from "./scan.js";
// import { openDatabase } from "./indexedDBUtils.js";

export const modal = document.getElementById("modal");
export const modalDetails = document.getElementById("modal-details");
export const closeButton = document.getElementById("close-button");
export const saveButton = document.getElementById("save-button");

// Глобальные переменные
let currentStudentData = {}; // Переменная для хранения данных текущего студента
let isEditing = false; // Флаг для редактирования
console.log("isEditing =", isEditing); // Вывод значения isEditing в консоль

export async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("StudentsDatabase", 3); // Увеличьте версию

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("students")) {
        db.createObjectStore("students", {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("scans")) {
        db.createObjectStore("scans", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Открытие модального окна при клике на ФИО
tableBody.addEventListener("click", (event) => {
  const cell = event.target;
  const row = cell.parentElement;

  if (cell.cellIndex === 1) {
    const studentData = students[row.rowIndex - 2]; // Получаем данные студента
    if (!studentData || !studentData.country) {
      alert("Данные о студенте неполные!");
      return;
    }
    showModal(studentData);
  }
});

export function showModal(studentData) {
  saveButton.style.display = isEditing ? "block" : "none";
  modalDetails.innerHTML = generateModalContent(studentData);
  modal.style.display = "block";

  setupScanHandlers("scan1", studentData);
  setupScanHandlers("scan2", studentData);

  setupEditButton();
  setupDeleteButton();
  setupPrintButton();
}

function generateModalContent(studentData) {
  const country = studentData.country;
  const flagUrl = getFlagImage(studentData.country);
  return `
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
      <p><strong>Страна:</strong> <span contenteditable="false" class="editable" data-key="country">${country}</span>
      ${
        flagUrl
          ? `<img src="${flagUrl}" alt="Flag" class="country-flag" />`
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
  <button id="add-scan-button-scan1" style="display: none;"><i class="fa fa-plus"></i></button>
  <button id="view-scan-button-scan1"><i class="fa fa-eye"></i></button>
  <button id="delete-scan-button-scan1" style="display: none;"><i class="fa fa-minus"></i></button>
  <span id="scan-file-name-scan1"></span>
</div>
<div id="scan-controls-2">
  <button id="add-scan-button-scan2" style="display: none;"><i class="fa fa-plus"></i></button>
  <button id="view-scan-button-scan2"><i class="fa fa-eye"></i></button>
  <button id="delete-scan-button-scan2" style="display: none;"><i class="fa fa-minus"></i></button>
  <span id="scan-file-name-scan2"></span>
</div>

</div>
  `;
}

function setupEditButton() {
  document.getElementById("edit-button").addEventListener("click", () => {
    checkPassword(() => {
      const editableFields = document.querySelectorAll(".editable");
      editableFields.forEach((field) => (field.contentEditable = "true"));
      isEditing = true;
      updateScanButtons("scan1");
      updateScanButtons("scan2");
    });
  });
}

function setupDeleteButton() {
  document
    .getElementById("delete-button")
    .addEventListener("click", async () => {
      checkPassword(async () => {
        if (confirm("Вы уверены, что хотите удалить данные?")) {
          const index = students.findIndex(
            (student) => student.name === currentStudentData.name
          );
          if (index !== -1) {
            students.splice(index, 1);
            await deleteStudentFromIndexedDB(currentStudentData.name);
            updateTable(students);
            saveToFile(students, "students.json");
            closeModal();
          }
        }
      });
    });
}

// Закрытие модального окна через кнопку
closeButton.addEventListener("click", closeModal);
export async function closeModal() {
  if (isEditing) {
    if (confirm("Сохранить изменения перед закрытием?")) {
      await saveStudentData();
    } else {
      currentStudentData = null;
    }
  }
  modal.style.display = "none";
  isEditing = false;
}

async function saveStudentData() {
  const editableFields = document.querySelectorAll(".editable");
  editableFields.forEach((field) => {
    const key = field.dataset.key;
    currentStudentData[key] = field.textContent.trim();
  });

  try {
    const db = await openDatabase();
    const transaction = db.transaction(["students", "scans"], "readwrite");
    const studentsStore = transaction.objectStore("students");
    const scansStore = transaction.objectStore("scans");

    // Сохраняем сканы
    for (const scanKey of ["scan1", "scan2"]) {
      const scanData = await getScanDataFromIndexedDB(scanKey);
      if (scanData) {
        await new Promise((resolve, reject) => {
          const request = scansStore.put({ key: scanKey, data: scanData });
          request.onsuccess = resolve;
          request.onerror = reject;
        });
      } else {
        await new Promise((resolve, reject) => {
          const request = scansStore.delete(scanKey);
          request.onsuccess = resolve;
          request.onerror = reject;
        });
      }
    }

    // Сохраняем студента
    await new Promise((resolve, reject) => {
      const request = studentsStore.put(currentStudentData);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    alert("Ошибка сохранения данных: " + error.message);
    throw error;
  }

  updateTable(students);
}

function saveScanToIndexedDB(store, key, data) {
  return new Promise((resolve, reject) => {
    const request = store.put({ key, data });
    request.onsuccess = resolve;
    request.onerror = reject;
  });
}

function deleteScanFromIndexedDB(store, key) {
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = resolve;
    request.onerror = reject;
  });
}

async function getScanDataFromIndexedDB(key) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction("scans", "readonly");
    const store = transaction.objectStore("scans");

    return new Promise((resolve, reject) => {
      const getRequest = store.get(key);
      getRequest.onsuccess = () => resolve(getRequest.result?.data || null);
      getRequest.onerror = () => reject(null);
    });
  } catch (error) {
    console.warn("Сканы не найдены, создаем новое хранилище");
    return null;
  }
}

async function saveStudentToIndexedDB(student) {
  const db = await openDatabase();
  const transaction = db.transaction("students", "readwrite");
  const store = transaction.objectStore("students");

  return new Promise((resolve, reject) => {
    const request = store.put(student);
    request.onsuccess = resolve;
    request.onerror = reject;
  });
}

async function deleteStudentFromIndexedDB(name) {
  const db = await openDatabase();
  const transaction = db.transaction("students", "readwrite");
  const store = transaction.objectStore("students");

  return new Promise((resolve, reject) => {
    const index = store.index("name");
    const request = index.getKey(name);

    request.onsuccess = () => {
      if (request.result) {
        const deleteRequest = store.delete(request.result);
        deleteRequest.onsuccess = resolve;
        deleteRequest.onerror = reject;
      } else {
        resolve();
      }
    };
    request.onerror = reject;
  });
}
