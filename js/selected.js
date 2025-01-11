import { updateTable } from "./app.js";

document.addEventListener("DOMContentLoaded", function () {
  // Массив столбцов, для которых нужно добавить треугольники
  const columns = [
    "country",
    "gender",
    "group",
    "faculty",
    "course",
    // "educationType",
    "admissionYear",
    "graduationYear",
    "curator",
  ];

  // Создаем объект для хранения выбранных значений по каждому столбцу
  let selectedValuesByColumn = {};

  // Добавление треугольников для каждого столбца
  columns.forEach((columnId) => {
    const header = document.getElementById(columnId);

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

    // Инициализируем выбранные значения для этого столбца
    if (!selectedValuesByColumn[columnId]) {
      selectedValuesByColumn[columnId] = [];
    }

    // Добавляем обработчик клика для фильтрации
    dropdownIcon.addEventListener("click", (event) => {
      event.stopPropagation(); // Остановить всплытие события

      // Закрыть все открытые меню перед открытием нового
      closeAllDropdownMenus();

      let filterMenu = document.getElementById(`${columnId}-filter-menu`);
      if (!filterMenu) {
        filterMenu = document.createElement("div");
        filterMenu.id = `${columnId}-filter-menu`;
        filterMenu.className = "dropdown-menu";
        document.body.appendChild(filterMenu);
      }

      const studentsData =
        JSON.parse(localStorage.getItem("studentsData")) || [];
      const uniqueValues = [
        ...new Set(
          studentsData.map((student) => student[columnId]).filter(Boolean)
        ),
      ];

      filterMenu.innerHTML = "";

      // Все чекбоксы должны быть выбраны изначально
      uniqueValues.forEach((value) => {
        const label = document.createElement("label");
        label.style.display = "block";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = value;
        checkbox.checked = true; // Все чекбоксы с галочкой изначально
        selectedValuesByColumn[columnId].push(value); // Инициализация значений

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedValuesByColumn[columnId].push(value);
          } else {
            selectedValuesByColumn[columnId] = selectedValuesByColumn[
              columnId
            ].filter((selected) => selected !== value);
          }
          filterTableByColumn(columnId);
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(value));
        filterMenu.appendChild(label);
      });

      const rect = header.getBoundingClientRect();
      filterMenu.style.left = `${rect.left}px`;
      filterMenu.style.top = `${rect.bottom}px`;
      filterMenu.style.display = "block";
    });
  });

  // Функция фильтрации таблицы по выбранным значениям
  function filterTableByColumn(columnId) {
    const studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
    const selectedValues = selectedValuesByColumn[columnId];
    const filteredData = studentsData.filter((student) =>
      selectedValues.includes(student[columnId])
    );
    updateTable(filteredData);
  }

  // Закрыть все открытые дропменю
  function closeAllDropdownMenus() {
    const allMenus = document.querySelectorAll(".dropdown-menu");
    allMenus.forEach((menu) => {
      menu.style.display = "none";
    });
  }

  // Закрытие дропменю при клике вне меню
  document.addEventListener("click", (event) => {
    const dropdowns = document.querySelectorAll(".dropdown-menu");
    dropdowns.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.style.display = "none";
      }
    });
  });
});
