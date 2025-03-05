// печать модального окна
export function setupPrintButton() {
  document.getElementById("print-button").addEventListener("click", () => {
    // Добавляем стили для печати
    const printStyles = document.createElement("style");
    printStyles.innerHTML = `
      @media print {
        body * {
          visibility: hidden; /* Скрываем всё на странице */
        }
        .modal,
        .modal * {
          visibility: visible; /* Показываем только модальное окно */
        }
        .modal {
          position: absolute;
          left: 0;
          top: 0;
          width: 98%;
          height: auto;
          margin: 0;
          padding: 0;
          background: none;
          box-shadow: none;
          overflow: visible; /* Убираем полосу прокрутки */
        }
        .modal-content {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 10px;
          box-shadow: none;
          border: none;
          overflow: visible; /* Убираем полосу прокрутки */
        }
        .modal-details-table {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* Два столбца */
          gap: 10px;
        }
        .modal-details-item {
          break-inside: avoid; /* Предотвращает разрыв элементов на две страницы */
          box-shadow: none;
          border: 1px solid #ddd;
          padding: 5px;
        }
        .modal-details-item h3 {
          font-size: 1.1rem;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .modal-details-item p {
          margin: 5px 0;
          line-height: 1.4;
          color: #555;
        }
        button {
          display: none; /* Скрываем все кнопки */
        }
        ::-webkit-scrollbar {
          display: none; /* Скрываем полосу прокрутки */
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Вызываем печать
    window.print();

    // Удаляем стили после печати
    document.head.removeChild(printStyles);
  });
}

// флаги
export function getFlagImage(country) {
  const countryCodes = {
    Азербайджан: "az",
    "Арабская Республика Египет": "eg",
    Беларусь: "by",
    Венесуэла: "ve",
    Вьетнам: "vn",
    Гана: "gh",
    Зимбабве: "zw",
    Израиль: "il",
    Иордания: "jo",
    "Йеменская Республика": "ye",
    Казахстан: "kz",
    Китай: "cn",
    Нигерия: "ng",
    Россия: "ru",
    Сирия: "sy",
    Судан: "sd",
    Таджикистан: "tj",
    Туркменистан: "tm",
  };

  const countryCode = countryCodes[country];
  return countryCode ? `https://flagcdn.com/w320/${countryCode}.png` : "";
}
