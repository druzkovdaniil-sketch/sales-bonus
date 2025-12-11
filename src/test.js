// test.js - финальная версия для Node.js
const {
  calculateSimpleRevenue,
  calculateBonusByProfit,
  analyzeSalesData,
} = require("./main.js");

// Функция для загрузки датасета с добавлением экспорта
function loadDataset(filename) {
  const fs = require("fs");
  const path = require("path");

  try {
    const content = fs.readFileSync(
      path.join(__dirname, "..", "data", filename),
      "utf8"
    );

    // Добавляем экспорт для Node.js
    const modifiedContent =
      content +
      '\n\nif (typeof module !== "undefined" && module.exports) { module.exports = data; }';

    // Создаем временный файл
    const tempFile = path.join(__dirname, "temp_" + filename);
    fs.writeFileSync(tempFile, modifiedContent);

    // Загружаем данные
    const data = require(tempFile);

    // Удаляем временный файл
    fs.unlinkSync(tempFile);

    return data;
  } catch (error) {
    console.error(`❌ Ошибка загрузки ${filename}:`, error.message);
    return null;
  }
}

// Загружаем все датасеты
const dataset1 = loadDataset("dataset_1.js");
const dataset2 = loadDataset("dataset_2.js");
const dataset3 = loadDataset("dataset_3.js");

const options = {
  calculateRevenue: calculateSimpleRevenue,
  calculateBonus: calculateBonusByProfit,
};

function analyzeAndDisplay(data, datasetName) {
  console.log(`\n📊 Анализ ${datasetName}:`);
  console.log("=".repeat(50));

  if (!data) {
    console.log("❌ Данные не загружены");
    return null;
  }

  try {
    const result = analyzeSalesData(data, options);

    console.log(`✅ Успешно обработано:`);
    console.log(`   • Продавцов: ${result.length}`);
    console.log(`   • Товаров: ${data.products.length}`);
    console.log(`   • Продаж: ${data.purchase_records.length}`);

    // Топ-3 продавца
    console.log("\n🏆 ТОП-3 продавца:");
    result.slice(0, 3).forEach((seller, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
      console.log(`${medal} ${seller.name}:`);
      console.log(`   Прибыль: ${seller.profit.toFixed(2)} руб.`);
      console.log(
        `   Бонус: ${seller.bonus.toFixed(2)} руб. (${(
          seller.bonus_rate * 100
        ).toFixed(0)}%)`
      );
      console.log(`   Выручка: ${seller.revenue.toFixed(2)} руб.`);
      console.log(`   Продаж: ${seller.sales_count}`);
    });

    // Общая статистика
    const totalRevenue = result.reduce(
      (sum, seller) => sum + seller.revenue,
      0
    );
    const totalProfit = result.reduce((sum, seller) => sum + seller.profit, 0);
    const totalBonus = result.reduce((sum, seller) => sum + seller.bonus, 0);

    console.log("\n📈 Общая статистика:");
    console.log(`   Общая выручка: ${totalRevenue.toFixed(2)} руб.`);
    console.log(`   Общая прибыль: ${totalProfit.toFixed(2)} руб.`);
    console.log(`   Общий бонус: ${totalBonus.toFixed(2)} руб.`);

    return {
      name: datasetName,
      sellers: result.length,
      revenue: totalRevenue,
      profit: totalProfit,
      bonus: totalBonus,
    };
  } catch (error) {
    console.log(`❌ Ошибка анализа: ${error.message}`);
    return null;
  }
}

// Основной запуск
console.log("🚀 Запуск анализа всех датасетов");
console.log("=".repeat(50));

const results = [
  analyzeAndDisplay(dataset1, "dataset_1.js"),
  analyzeAndDisplay(dataset2, "dataset_2.js"),
  analyzeAndDisplay(dataset3, "dataset_3.js"),
].filter((r) => r !== null);

// Сводная таблица
console.log("\n" + "=".repeat(60));
console.log("📋 СВОДНАЯ ТАБЛИЦА ПО ВСЕМ ДАТАСЕТАМ:");
console.log("=".repeat(60));

console.log(
  "\nДатасет          | Продавцов | Выручка      | Прибыль     | Бонусы"
);
console.log("-".repeat(70));

results.forEach((result) => {
  console.log(
    `${result.name.padEnd(15)} | ` +
      `${result.sellers.toString().padEnd(9)} | ` +
      `${result.revenue.toFixed(0).padStart(10)} руб. | ` +
      `${result.profit.toFixed(0).padStart(9)} руб. | ` +
      `${result.bonus.toFixed(0).padStart(7)} руб.`
  );
});

console.log("\n" + "✅ Анализ завершен!");
