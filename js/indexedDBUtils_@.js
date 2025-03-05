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
