// Работа с IndexedDB
// База данных, созданная через IndexedDB, хранится локально на устройстве пользователя, в браузере, в специальном разделе для данных приложений.

// Подробности хранения:
// Локальное хранилище браузера:

// IndexedDB является частью браузера и хранит данные на стороне клиента. Это означает, что база данных сохраняется только на том устройстве и в том браузере, где она была создана.
// Данные остаются сохранёнными даже после закрытия вкладки или браузера (если пользователь их явно не удалил или если браузерная сессия не настроена на автоматическое удаление данных).
// Место хранения зависит от браузера:

// В Chrome данные IndexedDB хранятся в каталоге профиля пользователя:
// Например, на Windows:
// sql
// Копировать
// Редактировать
// C:\Users\<User>\AppData\Local\Google\Chrome\User Data\Default\IndexedDB
// Для других браузеров, таких как Firefox или Edge, пути аналогичны и зависят от их системных настроек.
// Изоляция по домену:

// База данных привязана к домену/происхождению (origin). Это означает, что доступ к данным базы можно получить только с того же домена, протокола и порта, с которого она была создана.
// Например:
// Если база была создана с https://example.com, она не будет доступна с http://example.com или https://sub.example.com.
// Объём данных:

// IndexedDB предоставляет больше места для хранения по сравнению с localStorage. Лимит зависит от браузера, но обычно это десятки или сотни мегабайт.
// Итог:
// База данных с именем StudentsDB будет локально сохранена в хранилище IndexedDB для домена, где выполняется ваш код. Она надёжна для работы в рамках одного клиента, но не предназначена для межустройственного синхронизации.

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
    request.onsuccess = () => {
      console.log("База данных открыта успешно.");
      resolve(request.result);
    };

    // Обработка ошибок при открытии базы данных
    request.onerror = () => {
      console.error("Ошибка при открытии базы данных:", request.error);
      reject(request.error);
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

    transaction.onerror = () => {
      console.error("Ошибка при сохранении данных:", transaction.error);
      reject(transaction.error);
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

    request.onerror = () => {
      console.error("Ошибка при загрузке данных:", request.error);
      reject(request.error);
    };
  });
}
