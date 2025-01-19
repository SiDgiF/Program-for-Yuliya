import { updateTable } from "./main.js"; // Импорт функции для обновления таблицы
import { openDB } from "./indexedDB.js"; // Импорт функции для открытия базы данных

// Основной обработчик DOMContentLoaded, выполняется после загрузки страницы
document.addEventListener("DOMContentLoaded", function () {
  const columns = [
    "country", // Столбец "Страна"
    "gender", // Столбец "Пол"
    "group", // Столбец "Группа"
    "faculty", // Столбец "Факультет"
    "course", // Столбец "Курс"
    "admissionYear", // Столбец "Год поступления"
    "graduationYear", // Столбец "Год выпуска"
    "curator", // Столбец "Куратор"
  ];

  let selectedValuesByColumn = {}; // Хранит выбранные значения для каждого столбца

  // Для каждого столбца создаем и обрабатываем выпадающий фильтр
  columns.forEach((columnId) => {
    const header = document.getElementById(columnId); // Заголовок столбца

    // Добавляем иконку выпадающего списка ▼, если ее еще нет
    let dropdownIcon = header.querySelector("span");
    if (!dropdownIcon) {
      dropdownIcon = document.createElement("span");
      dropdownIcon.innerHTML = "▼";
      dropdownIcon.style.fontSize = "12px";
      dropdownIcon.style.cursor = "pointer";
      dropdownIcon.style.position = "absolute";
      dropdownIcon.style.bottom = "0";
      dropdownIcon.style.left = "50%";
      dropdownIcon.style.transform = "translateX(-50%)";
      header.appendChild(dropdownIcon);
    }

    // Инициализируем выбранные значения для текущего столбца
    if (!selectedValuesByColumn[columnId]) {
      selectedValuesByColumn[columnId] = [];
    }

    // Обработчик клика на иконку ▼ для открытия меню фильтрации
    dropdownIcon.addEventListener("click", async (event) => {
      event.stopPropagation(); // Предотвращаем закрытие меню при клике внутри него
      closeAllDropdownMenus(); // Закрываем другие открытые меню

      let filterMenu = document.getElementById(`${columnId}-filter-menu`); // Меню фильтрации
      if (!filterMenu) {
        filterMenu = document.createElement("div");
        filterMenu.id = `${columnId}-filter-menu`;
        filterMenu.className = "dropdown-menu";
        document.body.appendChild(filterMenu); // Добавляем меню в документ
      }

      // Получаем уникальные значения для текущего столбца из базы данных
      const uniqueValues = await getUniqueValuesFromDB(columnId);
      filterMenu.innerHTML = ""; // Очищаем содержимое меню

      // Добавляем чекбокс "Выбрать всё" в начало меню
      const selectAllLabel = document.createElement("label");
      selectAllLabel.style.display = "block";

      const selectAllCheckbox = document.createElement("input");
      selectAllCheckbox.type = "checkbox";
      selectAllCheckbox.checked = true; // По умолчанию все значения выбраны

      // Обработчик выбора/снятия всех значений
      selectAllCheckbox.addEventListener("change", () => {
        const checkboxes = filterMenu.querySelectorAll(
          "input[type='checkbox']"
        );
        checkboxes.forEach((checkbox) => {
          checkbox.checked = selectAllCheckbox.checked;
          const value = checkbox.value;
          if (
            selectAllCheckbox.checked &&
            !selectedValuesByColumn[columnId].includes(value)
          ) {
            selectedValuesByColumn[columnId].push(value);
          } else if (!selectAllCheckbox.checked) {
            selectedValuesByColumn[columnId] = [];
          }
        });
        filterTableByColumn(columnId); // Фильтруем таблицу по обновленным значениям
      });

      selectAllLabel.appendChild(selectAllCheckbox);
      selectAllLabel.appendChild(document.createTextNode("Выбрать всё"));
      filterMenu.appendChild(selectAllLabel);

      // Добавляем чекбоксы для каждого уникального значения
      uniqueValues.forEach((value) => {
        const label = document.createElement("label");
        label.style.display = "block";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = value;
        checkbox.checked = true; // По умолчанию все значения выбраны
        selectedValuesByColumn[columnId].push(value);

        // Обработчик изменения состояния отдельного чекбокса
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedValuesByColumn[columnId].push(value);
          } else {
            selectedValuesByColumn[columnId] = selectedValuesByColumn[
              columnId
            ].filter((selected) => selected !== value);
          }

          // Проверяем, выбраны ли все значения
          const allChecked = Array.from(
            filterMenu.querySelectorAll("input[type='checkbox']")
          ).every((cb) => cb.checked);
          selectAllCheckbox.checked = allChecked;

          filterTableByColumn(columnId); // Обновляем таблицу
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(value));
        filterMenu.appendChild(label);
      });

      // Располагаем меню под заголовком
      const rect = header.getBoundingClientRect();
      filterMenu.style.left = `${rect.left}px`;
      filterMenu.style.top = `${rect.bottom}px`;
      filterMenu.style.display = "block";
    });
  });

  // Фильтруем данные в таблице на основе выбранных значений
  async function filterTableByColumn(columnId) {
    const db = await openDB(); // Открываем базу данных
    const transaction = db.transaction("students", "readonly"); // Транзакция только для чтения
    const store = transaction.objectStore("students"); // Хранилище студентов

    const selectedValues = selectedValuesByColumn[columnId]; // Выбранные значения
    const filteredData = []; // Отфильтрованные записи

    return new Promise((resolve) => {
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result; // Текущая запись
        if (cursor) {
          if (selectedValues.includes(cursor.value[columnId])) {
            filteredData.push(cursor.value); // Добавляем запись, если она соответствует выбранным значениям
          }
          cursor.continue(); // Переходим к следующей записи
        } else {
          updateTable(filteredData); // Обновляем таблицу
          resolve();
        }
      };
    });
  }

  // Получаем уникальные значения для столбца из базы данных
  async function getUniqueValuesFromDB(columnId) {
    const db = await openDB(); // Открываем базу данных
    const transaction = db.transaction("students", "readonly"); // Транзакция только для чтения
    const store = transaction.objectStore("students"); // Хранилище студентов

    const uniqueValues = new Set(); // Множество уникальных значений

    return new Promise((resolve) => {
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result; // Текущая запись
        if (cursor) {
          uniqueValues.add(cursor.value[columnId]); // Добавляем уникальное значение
          cursor.continue(); // Переходим к следующей записи
        } else {
          resolve([...uniqueValues].filter(Boolean)); // Возвращаем массив уникальных значений
        }
      };
    });
  }

  // Закрываем все открытые меню фильтрации
  function closeAllDropdownMenus() {
    const allMenus = document.querySelectorAll(".dropdown-menu");
    allMenus.forEach((menu) => {
      menu.style.display = "none";
    });
  }

  // Закрываем меню фильтрации при клике вне них
  document.addEventListener("click", (event) => {
    const dropdowns = document.querySelectorAll(".dropdown-menu");
    dropdowns.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.style.display = "none";
      }
    });
  });
});

// ********************************ПОИСК*****************************
// Элемент строки поиска
const searchInput = document.getElementById("student-search");

// Открытие поля ввода при клике на контейнер поиска
document
  .querySelector(".search-container")
  .addEventListener("click", (event) => {
    event.stopPropagation(); // Предотвращаем закрытие поля ввода при клике внутри контейнера
    const searchInputWrapper = document.querySelector(".search-input-wrapper");
    searchInputWrapper.style.display = "inline-block"; // Показываем поле ввода
  });

// Закрытие поля ввода при клике вне поля (на любом другом месте)
document.addEventListener("click", (event) => {
  const searchInputWrapper = document.querySelector(".search-input-wrapper");

  // Проверяем, был ли клик внутри поля ввода или контейнера
  const isClickInsideSearchInput = searchInputWrapper.contains(event.target);
  const isClickInsideSearchContainer = document
    .querySelector(".search-container")
    .contains(event.target);

  // Если клик был вне поля ввода и контейнера, скрываем поле ввода
  if (!isClickInsideSearchInput && !isClickInsideSearchContainer) {
    searchInputWrapper.style.display = "none";
  }
});

// Обработчик ввода текста в строку поиска
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase(); // Приводим запрос к нижнему регистру для нечувствительности к регистру

  // Если строка поиска пуста, загружаем всех студентов
  if (!query) {
    const allStudents = await getAllStudentsFromDB();
    updateTable(allStudents); // Обновляем таблицу с полным списком
    return;
  }

  // Если введен запрос, фильтруем студентов по запросу
  const filteredStudents = await searchStudentsByName(query);
  updateTable(filteredStudents); // Обновляем таблицу с отфильтрованным списком
});

// Поиск студентов по запросу в поле "name" (ФИО)
async function searchStudentsByName(query) {
  const db = await openDB(); // Открываем соединение с IndexedDB
  const transaction = db.transaction("students", "readonly"); // Открываем транзакцию на чтение
  const store = transaction.objectStore("students"); // Получаем хранилище объектов "students"

  const results = []; // Массив для хранения результатов поиска

  return new Promise((resolve) => {
    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result; // Получаем текущую запись
      if (cursor) {
        const fullName = cursor.value.name.toLowerCase(); // Приводим имя студента к нижнему регистру
        if (fullName.includes(query)) {
          results.push(cursor.value); // Добавляем запись в результаты, если она соответствует запросу
        }
        cursor.continue(); // Переходим к следующей записи
      } else {
        resolve(results); // Возвращаем массив результатов, когда записи заканчиваются
      }
    };
  });
}

// Получение всех студентов из IndexedDB
async function getAllStudentsFromDB() {
  const db = await openDB(); // Открываем соединение с IndexedDB
  const transaction = db.transaction("students", "readonly"); // Открываем транзакцию на чтение
  const store = transaction.objectStore("students"); // Получаем хранилище объектов "students"

  const allStudents = []; // Массив для хранения всех студентов

  return new Promise((resolve) => {
    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result; // Получаем текущую запись
      if (cursor) {
        allStudents.push(cursor.value); // Добавляем запись в массив всех студентов
        cursor.continue(); // Переходим к следующей записи
      } else {
        resolve(allStudents); // Возвращаем массив всех студентов, когда записи заканчиваются
      }
    };
  });
}
