let isEditing = false; // Флаг для редактирования

// Функция для обновления кнопок
export function updateScanButtons(scanKey) {
  const addButton = document.getElementById(`add-scan-button-${scanKey}`);
  const viewButton = document.getElementById(`view-scan-button-${scanKey}`);
  const deleteButton = document.getElementById(`delete-scan-button-${scanKey}`);

  if (!addButton || !viewButton || !deleteButton) {
    console.error("Одной или нескольких кнопок не найдено");
    return;
  }

  if (isEditing) {
    addButton.style.display = "none";
    viewButton.style.display = "none";
    deleteButton.style.display = "none";
  } else {
    addButton.style.display = "block";
    viewButton.style.display = "block";
    deleteButton.style.display = "block";
  }
}

export function setupScanHandlers(scanKey, studentData) {
  const addButton = document.getElementById(`add-scan-button-${scanKey}`);
  const viewButton = document.getElementById(`view-scan-button-${scanKey}`);

  const deleteButton = document.getElementById(`delete-scan-button-${scanKey}`);
  const fileNameContainer = document.getElementById(
    `scan-file-name-${scanKey}`
  );

  if (!addButton || !viewButton || !deleteButton || !fileNameContainer) {
    console.error("Один или несколько элементов управления сканом не найдены.");
    return;
  }

  // Если в данных студента есть данные для скана
  if (studentData && studentData[scanKey]) {
    fileNameContainer.textContent = "Скан загружен";
    viewButton.style.display = "block";
    addButton.style.display = "none";
  } else {
    fileNameContainer.textContent = ""; // Очищаем текст
    viewButton.style.display = "none";
  }

  // Добавляем обработчик на кнопку добавления скана
  addButton.addEventListener("click", () => {
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
        viewButton.style.display = "block";
        addButton.style.display = "none";

        deleteButton.style.display = "block";

        // Устанавливаем текст "Скан загружен"
        fileNameContainer.textContent = "Скан загружен";
      }
    });

    // Открываем окно выбора файла
    fileInput.click();
  });

  // Реализация удаления
  deleteButton.addEventListener("click", () => {
    console.log(`Удалить скан ${scanKey}`);
    localStorage.removeItem(scanKey); // Удаляем из localStorage
    studentData[scanKey] = null; // Удаляем из данных студента

    // Обновляем текст и кнопки
    fileNameContainer.textContent = "";
    viewButton.style.display = "none";
    addButton.style.display = "block";

    deleteButton.style.display = "none";
  });

  //! Реализация просмотра файла
  // Реализация просмотра файла
  // viewButton.addEventListener("click", () => {
  //   const base64String = localStorage.getItem(scanKey); // Получаем файл из localStorage

  //   if (!base64String) {
  //     console.error("Файл для просмотра не найден.");
  //     alert("Файл для просмотра не найден.");
  //     return;
  //   }

  //   const fileType = base64String.split(";")[0].split(":")[1]; // Извлекаем MIME-тип

  //   if (fileType.startsWith("image/")) {
  //     // Если это изображение, открываем его в новом окне
  //     const newWindow = window.open();
  //     newWindow.document.write(
  //       `<img src="${base64String}" alt="Просмотр скана" style="max-width: 100%; max-height: 100%;">`
  //     );
  //     newWindow.document.title = "Просмотр скана";
  //   } else if (fileType === "application/pdf") {
  //     // Если это PDF, открываем его в новом окне
  //     const newWindow = window.open();
  //     newWindow.document.write(
  //       `<iframe src="${base64String}" style="width: 100%; height: 100%;" frameborder="0"></iframe>`
  //     );
  //     newWindow.document.title = "Просмотр PDF";
  //   } else {
  //     // Если тип файла неизвестен
  //     console.error("Неподдерживаемый формат файла для просмотра.");
  //     alert("Неподдерживаемый формат файла для просмотра.");
  //   }
  // });
  // Реализация просмотра файла
  viewButton.addEventListener("click", () => {
    let base64String = localStorage.getItem(scanKey); // Получаем файл из localStorage

    if (!base64String) {
      // Если файла нет в localStorage, ищем в JSON
      console.log("Файл не найден в localStorage. Проверяем JSON...");
      if (studentData && studentData[scanKey]) {
        base64String = studentData[scanKey];
      }

      if (!base64String) {
        console.error(
          "Файл для просмотра не найден ни в localStorage, ни в JSON."
        );
        alert("Файл для просмотра не найден.");
        return;
      }
    }

    const fileType = base64String.split(";")[0].split(":")[1]; // Извлекаем MIME-тип

    if (fileType.startsWith("image/")) {
      // Если это изображение, открываем его в новом окне
      const newWindow = window.open();
      newWindow.document.write(
        `<img src="${base64String}" alt="Просмотр скана" style="max-width: 100%; max-height: 100%;">`
      );
      newWindow.document.title = "Просмотр скана";
    } else if (fileType === "application/pdf") {
      // Если это PDF, открываем его в новом окне
      const newWindow = window.open();
      newWindow.document.write(
        `<iframe src="${base64String}" style="width: 100%; height: 100%;" frameborder="0"></iframe>`
      );
      newWindow.document.title = "Просмотр PDF";
    } else {
      // Если тип файла неизвестен
      console.error("Неподдерживаемый формат файла для просмотра.");
      alert("Неподдерживаемый формат файла для просмотра.");
    }
  });
}

// Функция для обработки загрузки файла
// function handleFileUpload(scanKey, file) {
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
//   const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"]; // Допустимые типы файлов

//   // Проверяем размер файла
//   if (file.size > MAX_FILE_SIZE) {
//     console.error(
//       `Файл слишком большой. Максимальный размер: ${
//         MAX_FILE_SIZE / (1024 * 1024)
//       } МБ.`
//     );
//     alert("Файл слишком большой. Максимальный размер: 5 МБ.");
//     return;
//   }

//   // Проверяем тип файла
//   if (!ALLOWED_TYPES.includes(file.type)) {
//     console.error(
//       "Недопустимый формат файла. Разрешены только изображения (JPEG, PNG) и PDF."
//     );
//     alert(
//       "Недопустимый формат файла. Разрешены только изображения (JPEG, PNG) и PDF."
//     );
//     return;
//   }

//   const reader = new FileReader();

//   reader.onload = () => {
//     try {
//       const base64String = reader.result; // Преобразуем файл в Base64
//       localStorage.setItem(scanKey, base64String); // Сохраняем Base64 в localStorage
//       console.log(`Файл успешно сохранён в Base64 с ключом ${scanKey}`);
//     } catch (error) {
//       console.error("Ошибка при сохранении файла в localStorage:", error);
//       alert("Произошла ошибка при сохранении файла. Попробуйте снова.");
//     }
//   };

//   reader.onerror = () => {
//     console.error("Ошибка чтения файла:", reader.error);
//     alert("Не удалось прочитать файл. Попробуйте снова.");
//   };

//   reader.readAsDataURL(file); // Читаем файл как Data URL
// }

function handleFileUpload(scanKey, file) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"]; // Допустимые типы файлов
  const STORAGE_QUOTA_WARNING =
    "Недостаточно места в хранилище для сохранения файла.";

  // Проверяем размер файла
  if (file.size > MAX_FILE_SIZE) {
    console.error(
      `Файл слишком большой. Максимальный размер: ${
        MAX_FILE_SIZE / (1024 * 1024)
      } МБ.`
    );
    alert("Файл слишком большой. Максимальный размер: 5 МБ.");
    return;
  }

  // Проверяем тип файла
  if (!ALLOWED_TYPES.includes(file.type)) {
    console.error(
      "Недопустимый формат файла. Разрешены только изображения (JPEG, PNG) и PDF."
    );
    alert(
      "Недопустимый формат файла. Разрешены только изображения (JPEG, PNG) и PDF."
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const base64String = reader.result; // Преобразуем файл в Base64

      // Проверка доступного места в localStorage
      try {
        localStorage.setItem("__test", base64String);
        localStorage.removeItem("__test");
      } catch (error) {
        console.error(STORAGE_QUOTA_WARNING, error);
        alert(STORAGE_QUOTA_WARNING);
        return;
      }

      localStorage.setItem(scanKey, base64String); // Сохраняем Base64 в localStorage
      console.log(`Файл успешно сохранён в Base64 с ключом ${scanKey}`);
    } catch (error) {
      console.error("Ошибка при сохранении файла в localStorage:", error);
      alert("Произошла ошибка при сохранении файла. Попробуйте снова.");
    }
  };

  reader.onerror = () => {
    console.error("Ошибка чтения файла:", reader.error);
    alert("Не удалось прочитать файл. Попробуйте снова.");
  };

  reader.readAsDataURL(file); // Читаем файл как Data URL
}
