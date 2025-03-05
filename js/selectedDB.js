import { updateTable } from "./main.js";
import { openDB } from "./indexedDB.js";

document.addEventListener("DOMContentLoaded", () => {
  const columns = [
    "country",
    "gender",
    "group",
    "faculty",
    "course",
    "admissionYear",
    "graduationYear",
    "curator",
  ];
  const selectedValuesByColumn = {};

  // Инициализация фильтров для каждой колонки
  columns.forEach((columnId) => initializeFilter(columnId));

  // Основная функция для инициализации фильтра
  function initializeFilter(columnId) {
    const header = document.getElementById(columnId);
    const dropdownIcon = createDropdownIcon(header);
    selectedValuesByColumn[columnId] = [];

    dropdownIcon.addEventListener("click", async (event) => {
      event.stopPropagation();
      closeAllDropdownMenus();
      const filterMenu = await createFilterMenu(columnId);
      showFilterMenu(filterMenu, header);
    });
  }

  // Создание иконки ▼ для заголовка
  function createDropdownIcon(header) {
    let icon = header.querySelector("span");
    if (!icon) {
      icon = document.createElement("span");
      icon.innerHTML = "▼";
      icon.style.cssText =
        "font-size: 12px; cursor: pointer; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);";
      header.appendChild(icon);
    }
    return icon;
  }

  // Создание меню фильтрации
  async function createFilterMenu(columnId) {
    let filterMenu = document.getElementById(`${columnId}-filter-menu`);
    if (!filterMenu) {
      filterMenu = document.createElement("div");
      filterMenu.id = `${columnId}-filter-menu`;
      filterMenu.className = "dropdown-menu";
      document.body.appendChild(filterMenu);
    }

    const uniqueValues = await getUniqueValuesFromDB(columnId);
    filterMenu.innerHTML = renderFilterMenu(uniqueValues);

    // Обработчик "Выбрать всё"
    const selectAllCheckbox = filterMenu.querySelector(
      "input[type='checkbox']"
    );
    selectAllCheckbox.addEventListener("change", (event) =>
      handleSelectAll(event, columnId)
    );

    // Обработчики для каждого чекбокса
    filterMenu
      .querySelectorAll("input[type='checkbox'][value]")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () =>
          handleCheckboxChange(checkbox, columnId)
        );
      });

    return filterMenu;
  }

  // Генерация HTML для меню фильтрации
  function renderFilterMenu(uniqueValues) {
    const checkboxes = uniqueValues
      .map(
        (value) =>
          `<label><input type="checkbox" value="${value}" checked> ${value}</label>`
      )
      .join("");
    return `<label><input type="checkbox" checked> Выбрать всё</label>${checkboxes}`;
  }

  // Обработчик для чекбокса "Выбрать всё"
  function handleSelectAll(event, columnId) {
    const filterMenu = document.getElementById(`${columnId}-filter-menu`);
    const checkboxes = filterMenu.querySelectorAll(
      "input[type='checkbox'][value]"
    );
    selectedValuesByColumn[columnId] = event.target.checked
      ? Array.from(checkboxes).map((cb) => cb.value)
      : [];
    checkboxes.forEach((cb) => (cb.checked = event.target.checked));
    filterTableByColumn(columnId);
  }

  // Обработчик изменения отдельного чекбокса
  function handleCheckboxChange(checkbox, columnId) {
    if (checkbox.checked) {
      selectedValuesByColumn[columnId].push(checkbox.value);
    } else {
      selectedValuesByColumn[columnId] = selectedValuesByColumn[
        columnId
      ].filter((val) => val !== checkbox.value);
    }
    filterTableByColumn(columnId);
  }

  // Показать меню фильтрации под заголовком
  function showFilterMenu(filterMenu, header) {
    const rect = header.getBoundingClientRect();
    filterMenu.style.left = `${rect.left}px`;
    filterMenu.style.top = `${rect.bottom}px`;
    filterMenu.style.display = "flex";
  }

  // Закрыть все открытые меню фильтрации
  function closeAllDropdownMenus() {
    document
      .querySelectorAll(".dropdown-menu")
      .forEach((menu) => (menu.style.display = "none"));
  }

  // Фильтрация таблицы по выбранным значениям
  async function filterTableByColumn(columnId) {
    const db = await openDB();
    const transaction = db.transaction("students", "readonly");
    const store = transaction.objectStore("students");
    const selectedValues = selectedValuesByColumn[columnId];
    const filteredData = [];

    return new Promise((resolve) => {
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (selectedValues.includes(cursor.value[columnId])) {
            filteredData.push(cursor.value);
          }
          cursor.continue();
        } else {
          updateTable(filteredData);
          resolve();
        }
      };
    });
  }

  // Получение уникальных значений из базы данных
  async function getUniqueValuesFromDB(columnId) {
    const db = await openDB();
    const transaction = db.transaction("students", "readonly");
    const store = transaction.objectStore("students");
    const uniqueValues = new Set();

    return new Promise((resolve) => {
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          uniqueValues.add(cursor.value[columnId]);
          cursor.continue();
        } else {
          resolve([...uniqueValues].filter(Boolean));
        }
      };
    });
  }

  // Закрыть меню фильтрации при клике вне его
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.style.display = "none";
      }
    });
  });

  // ********** Поиск студентов **********
  const searchInput = document.getElementById("student-search");
  document
    .querySelector(".search-container")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      document.querySelector(".search-input-wrapper").style.display =
        "inline-block";
    });

  document.addEventListener("click", (event) => {
    const searchInputWrapper = document.querySelector(".search-input-wrapper");
    if (
      !searchInputWrapper.contains(event.target) &&
      !document.querySelector(".search-container").contains(event.target)
    ) {
      searchInputWrapper.style.display = "none";
    }
  });

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase();
    if (!query) {
      const allStudents = await getAllStudentsFromDB();
      updateTable(allStudents);
      return;
    }
    const filteredStudents = await searchStudentsByName(query);
    updateTable(filteredStudents);
  });

  // Поиск студентов по имени
  async function searchStudentsByName(query) {
    const db = await openDB();
    const transaction = db.transaction("students", "readonly");
    const store = transaction.objectStore("students");
    const results = [];

    return new Promise((resolve) => {
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.name.toLowerCase().includes(query)) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  // Получение всех студентов из базы данных
  async function getAllStudentsFromDB() {
    const db = await openDB();
    const transaction = db.transaction("students", "readonly");
    const store = transaction.objectStore("students");
    const allStudents = [];

    return new Promise((resolve) => {
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          allStudents.push(cursor.value);
          cursor.continue();
        } else {
          resolve(allStudents);
        }
      };
    });
  }
});
