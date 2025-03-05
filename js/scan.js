const DB_NAME = "ScansDatabase";
const DB_VERSION = 1;
let isEditing = false; // Флаг для редактирования

// Открытие базы данных
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("scans")) {
        db.createObjectStore("scans", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Функции для работы с IndexedDB
async function saveFileToDB(scanKey, base64String) {
  const db = await openDatabase();
  const transaction = db.transaction("scans", "readwrite");
  const store = transaction.objectStore("scans");

  return new Promise((resolve, reject) => {
    const request = store.put({ key: scanKey, data: base64String });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getFileFromDB(scanKey) {
  const db = await openDatabase();
  const transaction = db.transaction("scans", "readonly");
  const store = transaction.objectStore("scans");

  return new Promise((resolve, reject) => {
    const request = store.get(scanKey);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFileFromDB(scanKey) {
  const db = await openDatabase();
  const transaction = db.transaction("scans", "readwrite");
  const store = transaction.objectStore("scans");

  return new Promise((resolve, reject) => {
    const request = store.delete(scanKey);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

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

    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0]; // Получаем файл

      if (file) {
        await handleFileUpload(scanKey, file); // Обработка загрузки файла
        currentStudentData[scanKey] = true;
        viewButton.style.display = "block";
        addButton.style.display = "none";
        deleteButton.style.display = "block";
        fileNameContainer.textContent = "Скан загружен";
      }
    });

    fileInput.click(); // Открываем окно выбора файла
  });

  // Реализация удаления
  deleteButton.addEventListener("click", async () => {
    try {
      await deleteFileFromDB(scanKey);
      console.log(`Файл ${scanKey} удалён из IndexedDB`);

      fileNameContainer.textContent = "";
      viewButton.style.display = "none";
      addButton.style.display = "block";
      deleteButton.style.display = "none";
    } catch (error) {
      console.error("Ошибка удаления файла:", error);
    }
  });

  // Реализация просмотра файла
  viewButton.addEventListener("click", async () => {
    try {
      const base64String = await getFileFromDB(scanKey);
      if (!base64String) {
        console.error("Файл для просмотра не найден.");
        return;
      }

      const fileType = base64String.split(";")[0].split(":")[1]; // Извлекаем MIME-тип

      if (fileType.startsWith("image/")) {
        const newWindow = window.open();
        newWindow.document.write(
          `<img src="${base64String}" alt="Просмотр скана" style="max-width: 100%; max-height: 100%;">`
        );
        newWindow.document.title = "Просмотр скана";
      } else if (fileType === "application/pdf") {
        const newWindow = window.open();
        newWindow.document.write(
          `<iframe src="${base64String}" style="width: 100%; height: 100%;" frameborder="0"></iframe>`
        );
        newWindow.document.title = "Просмотр PDF";
      } else {
        console.error("Неподдерживаемый формат файла для просмотра.");
      }
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
    }
  });
}

// Функция для обработки загрузки файла
async function handleFileUpload(scanKey, file) {
  const reader = new FileReader();

  reader.onload = async () => {
    const base64String = reader.result;
    try {
      await saveFileToDB(scanKey, base64String);
      console.log(`Файл успешно сохранён с ключом ${scanKey}`);
    } catch (error) {
      console.error("Ошибка сохранения файла:", error);
    }
  };

  reader.readAsDataURL(file);
}
