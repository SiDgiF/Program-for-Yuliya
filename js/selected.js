import { updateTable } from "./app.js";

document.addEventListener("DOMContentLoaded", function () {
  // Список столбцов используется для добавления фильтров.
  // Эти столбцы выбраны, так как они представляют ключевые характеристики студентов, которые могут быть полезны для фильтрации.
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

  let selectedValuesByColumn = {};

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

    if (!selectedValuesByColumn[columnId]) {
      selectedValuesByColumn[columnId] = [];
    }

    dropdownIcon.addEventListener("click", (event) => {
      event.stopPropagation();
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

      const selectAllLabel = document.createElement("label");
      selectAllLabel.style.display = "block";

      const selectAllCheckbox = document.createElement("input");
      selectAllCheckbox.type = "checkbox";
      selectAllCheckbox.checked = true;

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
        filterTableByColumn(columnId);
      });

      selectAllLabel.appendChild(selectAllCheckbox);
      selectAllLabel.appendChild(document.createTextNode("Выбрать всё"));
      filterMenu.appendChild(selectAllLabel);

      uniqueValues.forEach((value) => {
        const label = document.createElement("label");
        label.style.display = "block";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = value;
        checkbox.checked = true;
        selectedValuesByColumn[columnId].push(value);

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedValuesByColumn[columnId].push(value);
          } else {
            selectedValuesByColumn[columnId] = selectedValuesByColumn[
              columnId
            ].filter((selected) => selected !== value);
          }

          const allChecked = Array.from(
            filterMenu.querySelectorAll("input[type='checkbox']")
          ).every((cb) => cb.checked);
          selectAllCheckbox.checked = allChecked;

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

  function filterTableByColumn(columnId) {
    const studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
    const selectedValues = selectedValuesByColumn[columnId];
    const filteredData = studentsData.filter((student) =>
      selectedValues.includes(student[columnId])
    );
    updateTable(filteredData);
  }

  function closeAllDropdownMenus() {
    const allMenus = document.querySelectorAll(".dropdown-menu");
    allMenus.forEach((menu) => {
      menu.style.display = "none";
    });
  }

  document.addEventListener("click", (event) => {
    const dropdowns = document.querySelectorAll(".dropdown-menu");
    dropdowns.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.style.display = "none";
      }
    });
  });
});

// Поиск
