/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const { discount = 0, sale_price, quantity } = purchase;

  // 1. Переводим скидку из процентов в десятичное число
  const decimalDiscount = discount / 100;

  // 2. Рассчитываем полную стоимость (цена × количество)
  const fullPrice = sale_price * quantity;

  // 3. Вычисляем выручку с учетом скидки
  const revenue = fullPrice * (1 - decimalDiscount);

  return revenue;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге
  const { profit } = seller;

  if (total === 0) return 0;

  let rate = 0;

  // 15% — для продавца, который принёс наибольшую прибыль
  if (index === 0 && total > 1) {
    rate = 0.15;
  }
  // 10% — для продавцов, которые по прибыли находятся на втором и третьем месте
  else if ((index === 1 || index === 2) && total > 2) {
    rate = 0.1;
  }
  // 5% — для всех остальных продавцов, кроме самого последнего
  else if (index < total - 1) {
    rate = 0.05;
  }
  // 0% — для продавца на последнем месте
  else {
    rate = 0;
  }

  // Возвращаем СУММУ бонуса
  return profit * rate;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (!data) {
    throw new Error("Данные не предоставлены");
  }

  if (!Array.isArray(data.sellers) || data.sellers.length === 0) {
    throw new Error("Данные о продавцах должны быть непустым массивом");
  }

  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error("Данные о товарах должны быть непустым массивом");
  }

  if (
    !Array.isArray(data.purchase_records) ||
    data.purchase_records.length === 0
  ) {
    throw new Error("Данные о продажах должны быть непустым массивом");
  }

  // @TODO: Проверка наличия опций
  if (!options) {
    throw new Error("Опции не предоставлены");
  }

  const { calculateRevenue, calculateBonus } = options;

  if (typeof calculateRevenue !== "function") {
    throw new Error(
      "Функция calculateRevenue должна быть предоставлена в опциях"
    );
  }

  if (typeof calculateBonus !== "function") {
    throw new Error(
      "Функция calculateBonus должна быть предоставлена в опциях"
    );
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellersStats = {};

  // Инициализируем объекты статистики для каждого продавца
  data.sellers.forEach((seller) => {
    sellersStats[seller.id] = {
      id: seller.id,
      name: `${seller.first_name} ${seller.last_name}`,
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products_sold: {}, // Для подсчета проданных товаров
    };
  });

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const productsIndex = {};
  data.products.forEach((product) => {
    productsIndex[product.sku] = product;
  });

  // Считаем количество чеков по продавцам
  const receiptCounts = {};
  data.sellers.forEach((seller) => {
    receiptCounts[seller.id] = 0;
  });

  // Сначала считаем количество чеков
  data.purchase_records.forEach((purchase) => {
    if (receiptCounts[purchase.seller_id] !== undefined) {
      receiptCounts[purchase.seller_id] += 1;
    }
  });

  // @TODO: Расчет выручки и прибыли для каждого продавца
  data.purchase_records.forEach((purchase) => {
    const sellerId = purchase.seller_id;

    // Пропускаем если продавец не найден
    if (!sellersStats[sellerId]) {
      return;
    }

    // Обрабатываем каждый товар в чеке
    purchase.items.forEach((item) => {
      const productSku = item.sku;
      const product = productsIndex[productSku];

      // Пропускаем если товар не найден
      if (!product) {
        return;
      }

      // Вычисляем выручку от этой продажи
      const revenue = calculateRevenue(
        {
          discount: item.discount,
          sale_price: item.sale_price,
          quantity: item.quantity,
        },
        product
      );

      // В реальных данных себестоимость называется purchase_price
      const cost = product.purchase_price * item.quantity;

      // Вычисляем прибыль
      const profit = revenue - cost;

      // Обновляем статистику продавца
      const sellerStats = sellersStats[sellerId];
      sellerStats.revenue = parseFloat(
        (sellerStats.revenue + revenue).toFixed(2)
      );
      sellerStats.profit += profit;

      // Обновляем информацию о проданных товарах
      if (!sellerStats.products_sold[productSku]) {
        sellerStats.products_sold[productSku] = 0;
      }
      sellerStats.products_sold[productSku] += item.quantity;
    });
  });

  // Устанавливаем количество продаж (количество чеков)
  Object.keys(sellersStats).forEach((sellerId) => {
    sellersStats[sellerId].sales_count = receiptCounts[sellerId] || 0;
  });

  // Преобразуем объект статистики в массив для сортировки
  const sellerStats = Object.values(sellersStats);

  // @TODO: Сортировка продавцов по прибыли
  sellerStats.sort((a, b) => b.profit - a.profit);

  // @TODO: Назначение премий на основе ранжирования и определение топ товаров
  sellerStats.forEach((seller, index) => {
    // Расчет бонуса
    seller.bonus = calculateBonus(index, sellerStats.length, seller);

    // Определение топ-10 товаров по количеству продаж
    // Сначала сортируем по убыванию quantity, при равенстве - по возрастанию sku
  //   seller.top_products = Object.entries(seller.products_sold)
  //     .map(([sku, quantity]) => ({ sku, quantity }))
  //     .sort((a, b) => {
  //       // Сортировка по убыванию количества
  //       if (b.quantity !== a.quantity) return b.quantity - a.quantity;
  //       // Если количество одинаковое - сортируем по sku по возрастанию
  //       return a.sku.localeCompare(b.sku);
  //     })
  //     .slice(0, 10);
  // });
  // seller.top_products = Object.entries(seller.products_sold)
  // .map(([sku, quantity]) => ({ sku, quantity }))
  // .sort((a, b) => {
  //   // Сортировка по убыванию количества
  //   if (b.quantity !== a.quantity) return b.quantity - a.quantity;
  //   // Если количество одинаковое - извлекаем номер из SKU
  //   return a.sku.localeCompare(b.sku); // Изменено на убывание
  // })
  // .slice(0, 10);
  seller.top_products = Object.entries(seller.products_sold)
 .map(([sku, quantity]) => {
    const product = productsIndex[sku];
    return { 
      sku, 
      quantity,
      purchase_price: productsIndex[sku].purchase_price
    };
  })
  .sort((a, b) => {
    // Сортировка по убыванию количества
    if (b.quantity !== a.quantity) return b.quantity - a.quantity;
    // Если количество одинаковое - сортируем по убыванию маржи
    return b.margin - a.margin;
  })
  .map(({ sku, quantity }) => ({ sku, quantity }))
  .slice(0, 10);
});

  // @TODO: Подготовка итоговой коллекции с нужными полями

  return sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2),
  }));
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateSimpleRevenue,
    calculateBonusByProfit,
    analyzeSalesData,
  };
}
