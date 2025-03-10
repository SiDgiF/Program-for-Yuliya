// Константы для имени базы данных и хранилища
const DB_NAME = "StudentsDB"; // Имя базы данных
const STORE_NAME = "students"; // Имя хранилища данных

/**
 * Открывает соединение с базой данных IndexedDB.
 * Если база данных или хранилище отсутствуют, создаёт их.
 *
 * @returns {Promise<IDBDatabase>} - Промис, который возвращает объект базы данных.
 */
async function openDB() {
  return new Promise((resolve, reject) => {
    console.log("Попытка открыть базу данных...");

    const request = indexedDB.open(DB_NAME, 1);

    // Обновление структуры базы данных (создание хранилища)
    request.onupgradeneeded = (event) => {
      console.log("Обновление базы данных...");
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id", // Уникальный ключ для каждой записи
          autoIncrement: true, // Автоматическое увеличение ключа
        });
        console.log(`Хранилище "${STORE_NAME}" создано.`);
      }
    };

    // Успешное открытие базы данных
    request.onsuccess = (event) => {
      console.log("База данных открыта успешно.");
      resolve(event.target.result);
    };

    // Обработка ошибок при открытии базы данных
    request.onerror = (event) => {
      console.error("Ошибка при открытии базы данных:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Сохраняет массив студентов в IndexedDB.
 * Очищает старые данные перед добавлением новых.
 *
 * @param {Array} data - Массив объектов студентов.
 * @returns {Promise<void>} - Промис, который завершится после завершения транзакции.
 */
async function saveStudents(data) {
  console.log("Сохранение данных студентов в IndexedDB...");

  const db = await openDB();

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    console.error(`Хранилище "${STORE_NAME}" не найдено.`);
    throw new Error(`Хранилище "${STORE_NAME}" не существует.`);
  }

  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  // Очищаем существующие данные
  store.clear();
  console.log("Старые данные очищены.");

  // Добавляем новые записи
  data.forEach((student) => {
    store.add(student);
    console.log("Добавлен студент:", student);
  });

  // Завершаем транзакцию и возвращаем промис
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log("Данные успешно сохранены.");
      resolve();
    };
    transaction.onerror = (event) => {
      console.error("Ошибка при сохранении данных:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Загружает всех студентов из IndexedDB.
 *
 * @returns {Promise<Array>} - Промис, который возвращает массив объектов студентов.
 */
async function loadStudents() {
  console.log("Загрузка данных студентов из IndexedDB...");

  const db = await openDB();

  if (!db.objectStoreNames.contains(STORE_NAME)) {
    console.error(`Хранилище "${STORE_NAME}" не найдено.`);
    throw new Error(`Хранилище "${STORE_NAME}" не существует.`);
  }

  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("Данные успешно загружены:", request.result);
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка при загрузке данных:", event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Открывает соединение с базой данных "StudentDatabase" и создаёт хранилище "scans", если оно отсутствует.
 *
 * @returns {Promise<IDBDatabase>} - Промис, который возвращает объект базы данных.
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("StudentDatabase", 1);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error("Ошибка открытия базы данных:", event.target.error);
      reject(event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("scans")) {
        const scansStore = db.createObjectStore("scans", {
          keyPath: "scanKey",
        });
        scansStore.createIndex("scanKey", "scanKey", { unique: true });
      }

      console.log("Структура базы данных обновлена.");
    };
  });
}

// Экспорт функций для использования в других модулях
export { openDB, saveStudents, loadStudents, openDatabase };
