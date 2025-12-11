// check.js в корневой папке
const fs = require('fs');

console.log("Проверка структуры проекта:");
console.log("==========================");

const checkFile = (path, name) => {
    if (fs.existsSync(path)) {
        console.log(`✅ ${name}: найден`);
        return true;
    } else {
        console.log(`❌ ${name}: не найден`);
        return false;
    }
};

checkFile('./src/main.js', 'main.js');
checkFile('./src/test.js', 'test.js');
checkFile('./data/dataset_1.js', 'dataset_1.js');
checkFile('./data/dataset_2.js', 'dataset_2.js');
checkFile('./data/dataset_3.js', 'dataset_3.js');

console.log("\nТекущая папка:", process.cwd());