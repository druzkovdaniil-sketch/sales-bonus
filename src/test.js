
// Импортируем функции из main.js (он в той же папке)
const { calculateSimpleRevenue, calculateBonusByProfit, analyzeSalesData } = require('./main.js');

// Загружаем реальные данные из dataset_1.js и тд
const realData = require('../data/index.js');

// Опции с функциями расчета
const options = {
    calculateRevenue: calculateSimpleRevenue,
    calculateBonus: calculateBonusByProfit
};

try {
    console.log("Запуск анализа данных о продажах...\n");
    
    // Анализируем реальные данные
    const result = analyzeSalesData(realData, options);
    
    console.log("✅ Анализ выполнен успешно!");
    console.log("Результат анализа:");
    console.log("==================");
    
    // Выводим топ-5 продавцов для краткости
    const topSellers = result.slice(0, 5);
    
    topSellers.forEach(seller => {
        console.log(`\n${seller.name} (ID: ${seller.seller_id}):`);
        console.log(`  Выручка: ${seller.revenue.toFixed(2)} руб.`);
        console.log(`  Прибыль: ${seller.profit.toFixed(2)} руб.`);
        console.log(`  Количество продаж: ${seller.sales_count}`);
        console.log(`  Бонус: ${seller.bonus.toFixed(2)} руб.`);
        console.log(`  Бонусная ставка: ${(seller.bonus / seller.profit * 100).toFixed(1)}%`);
        
        if (seller.top_products && seller.top_products.length > 0) {
            console.log(`  Топ товары:`);
            seller.top_products.forEach(product => {
                console.log(`    - ${product.product_name}: ${product.quantity} шт.`);
            });
        }
    });
    
    console.log(`\n... и еще ${result.length - 5} продавцов`);
    
    // Подсчет общих показателей
    const totalRevenue = result.reduce((sum, seller) => sum + seller.revenue, 0);
    const totalProfit = result.reduce((sum, seller) => sum + seller.profit, 0);
    const totalBonus = result.reduce((sum, seller) => sum + seller.bonus, 0);
    
    console.log("\n=================================");
    console.log("ОБЩИЕ ПОКАЗАТЕЛИ:");
    console.log("Всего продавцов:", result.length);
    console.log("Общая выручка:", totalRevenue.toFixed(2), "руб.");
    console.log("Общая прибыль:", totalProfit.toFixed(2), "руб.");
    console.log("Общая сумма бонусов:", totalBonus.toFixed(2), "руб.");
    
} catch (error) {
    console.error("❌ Ошибка при анализе данных:", error.message);
    console.error("Стек вызовов:", error.stack);
}