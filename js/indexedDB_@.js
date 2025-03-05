// Константы для имени базы данных и хранилища
const DB_NAME = "StudentsDB"; // Имя базы данных
const STORE_NAME = "students"; // Имя хранилища данных

/**
 * Открывает соединение с базой данных IndexedDB.
 * Если база данных или хранилище отсутствуют, создаёт их.
 *
 * @returns {Promise<IDBDatabase>} - Промис, который возвращает объект базы данных.
 */
export async function openDB() {
  return new Promise((resolve, reject) => {
    console.log("Попытка открыть базу данных...");

    // Открываем соединение с базой данных
    const request = indexedDB.open(DB_NAME, 1);

    // Если база данных впервые создаётся или версия обновляется
    request.onupgradeneeded = (event) => {
      console.log("Обновление базы данных...");
      const db = event.target.result;

      // Создаём хранилище, если его ещё нет
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
export async function saveStudents(data) {
  console.log("Сохранение данных студентов в IndexedDB...");

  // Открываем базу данных
  const db = await openDB();

  // Проверяем существование хранилища
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    console.error(`Хранилище "${STORE_NAME}" не найдено.`);
    throw new Error(`Хранилище "${STORE_NAME}" не существует.`);
  }

  // Создаём транзакцию на запись данных
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  // Очищаем существующие данные
  store.clear();
  console.log("Старые данные очищены.");

  // Добавляем новые данные по одному
  data.forEach((student) => {
    store.add(student);
    console.log("Добавлен студент:", student);
  });

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
export async function loadStudents() {
  console.log("Загрузка данных студентов из IndexedDB...");

  // Открываем базу данных
  const db = await openDB();

  // Проверяем существование хранилища
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    console.error(`Хранилище "${STORE_NAME}" не найдено.`);
    throw new Error(`Хранилище "${STORE_NAME}" не существует.`);
  }

  // Создаём транзакцию на чтение данных
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);

  // Получаем все данные из хранилища
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

export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("StudentDatabase", 1); // Создаём или открываем базу данных с именем "StudentDatabase"

    // Обработчик успешного открытия базы данных
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db); // Возвращаем объект базы данных
    };

    // Обработчик ошибки открытия базы данных
    request.onerror = (event) => {
      console.error("Ошибка открытия базы данных:", event.target.error);
      reject(event.target.error);
    };

    // Обработчик обновления версии базы данных (создание структуры)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Проверяем и создаём хранилище объектов для сканов
      if (!db.objectStoreNames.contains("scans")) {
        const scansStore = db.createObjectStore("scans", {
          keyPath: "scanKey",
        }); // Хранилище с ключами "scanKey"
        scansStore.createIndex("scanKey", "scanKey", { unique: true }); // Индекс для поиска по ключу
      }

      console.log("Структура базы данных обновлена");
    };
  });
}
