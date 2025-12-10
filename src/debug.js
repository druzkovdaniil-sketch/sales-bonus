// debug.js в папке src
try {
    // Пробуем разные способы загрузки
    console.log("Попытка загрузить dataset_1.js...");
    
    // Способ 1: Обычный require
    const data1 = require('../data/dataset_1.js');
    console.log("Способ 1 - require:", Object.keys(data1));
    
    // Способ 2: Через fs.readFile
    const fs = require('fs');
    const datasetContent = fs.readFileSync('../data/dataset_1.js', 'utf8');
    
    // Ищем переменную data
    const match = datasetContent.match(/const data = (\{[\s\S]*\});/);
    if (match) {
        console.log("Найдена переменная data");
        // Парсим как JSON (осторожно, могут быть функции)
        try {
            const data = eval('(' + match[1] + ')');
            console.log("Успешно распарсено, продавцов:", data.sellers?.length);
        } catch (e) {
            console.log("Ошибка парсинга:", e.message);
        }
    }
    
} catch (error) {
    console.error("Ошибка загрузки:", error.message);
}