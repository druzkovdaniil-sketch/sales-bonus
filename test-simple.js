// test-simple.js в корневой папке
const fs = require("fs");

console.log("Тест загрузки dataset_1.js...");
const content = fs.readFileSync("./data/dataset_1.js", "utf8");

// Проверяем, есть ли data в файле
if (content.includes("const data = {")) {
  console.log("✅ Файл содержит переменную data");

  // Создаем временный файл с экспортом
  const tempContent =
    content + '\n\nif (typeof module !== "undefined") module.exports = data;';
  fs.writeFileSync("./temp_dataset.js", tempContent);

  try {
    const data = require("./temp_dataset.js");
    console.log("✅ Данные загружены успешно!");
    console.log("Продавцов:", data.sellers?.length);
    console.log("Товаров:", data.products?.length);
    console.log("Продаж:", data.purchase_records?.length);
    fs.unlinkSync("./temp_dataset.js");
  } catch (e) {
    console.error("❌ Ошибка загрузки:", e.message);
  }
} else {
  console.log("❌ Файл не содержит const data = {...}");
}
