// quick-test.js - простой тест
const { calculateSimpleRevenue, calculateBonusByProfit, analyzeSalesData } = require('./src/main.js');

// Тестовые данные как в тестах Jest
const testSeller = { profit: 1000 };
const testData = {
    sellers: [
        { id: 1, first_name: "Test", last_name: "Seller" }
    ],
    products: [
        { sku: "SKU1", purchase_price: 50, sale_price: 100 }
    ],
    purchase_records: [
        {
            seller_id: 1,
            items: [
                { sku: "SKU1", discount: 0, quantity: 2, sale_price: 100 }
            ]
        }
    ]
};

console.log("Тест 1: calculateBonusByProfit должен возвращать сумму, а не процент");
console.log("Для первого места с прибылью 1000 должно быть 150:", 
    calculateBonusByProfit(0, 5, testSeller) === 150 ? "✅" : "❌");

console.log("\nТест 2: calculateSimpleRevenue");
const purchase = { discount: 10, sale_price: 100, quantity: 2 };
const product = {};
const revenue = calculateSimpleRevenue(purchase, product);
console.log("Выручка при 10% скидке на 2 товара по 100:", revenue, revenue === 180 ? "✅" : "❌");

console.log("\nЗапускаем npm test для проверки всех тестов...");