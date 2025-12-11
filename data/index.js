// data/index.js - обертка для датасетов
const fs = require("fs");
const vm = require("vm");

function loadDataset(filename) {
  const code = fs.readFileSync(filename, "utf8");

  // Создаем контекст для выполнения
  const context = { data: null };
  vm.createContext(context);

  // Выполняем код
  vm.runInContext(code, context);

  // Возвращаем данные
  return context.data;
}

module.exports = {
  dataset1: loadDataset(__dirname + "/dataset_1.js"),
  dataset2: loadDataset(__dirname + "/dataset_2.js"),
  dataset3: loadDataset(__dirname + "/dataset_3.js"),
};
