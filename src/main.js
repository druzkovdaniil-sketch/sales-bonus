// main.js (адаптированная версия)
function calculateSimpleRevenue(purchase, _product) {
    const { discount = 0, sale_price, quantity } = purchase;
    const decimalDiscount = discount / 100;
    const fullPrice = sale_price * quantity;
    const revenue = fullPrice * (1 - decimalDiscount);
    return revenue;
}

function calculateBonusByProfit(index, total, seller) {
    if (total === 0) return 0;
    
    if (index === 0 && total > 1) {
        return 0.15;
    } else if ((index === 1 || index === 2) && total > 2) {
        return 0.10;
    } else if (index < total - 1) {
        return 0.05;
    } else {
        return 0;
    }
}

function analyzeSalesData(data, options) {
    // Проверка входных данных
    if (!data) throw new Error("Данные не предоставлены");
    
    if (!Array.isArray(data.sellers) || data.sellers.length === 0) {
        throw new Error("Данные о продавцах должны быть непустым массивом");
    }
    
    if (!Array.isArray(data.products) || data.products.length === 0) {
        throw new Error("Данные о товарах должны быть непустым массивом");
    }
    
    if (!Array.isArray(data.purchase_records) || data.purchase_records.length === 0) {
        throw new Error("Данные о продажах должны быть непустым массивом");
    }
    
    // Проверка наличия опций
    if (!options) throw new Error("Опции не предоставлены");
    
    const { calculateRevenue, calculateBonus } = options;
    
    if (typeof calculateRevenue !== 'function') {
        throw new Error("Функция calculateRevenue должна быть предоставлена в опциях");
    }
    
    if (typeof calculateBonus !== 'function') {
        throw new Error("Функция calculateBonus должна быть предоставлена в опциях");
    }
    
    // Подготовка промежуточных данных
    const sellersStats = {};
    
    data.sellers.forEach(seller => {
        sellersStats[seller.id] = {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        };
    });
    
    // Индексация товаров (используем sku как ключ)
    const productsIndex = {};
    data.products.forEach(product => {
        productsIndex[product.sku] = product;
    });
    
    // Расчет выручки и прибыли
    data.purchase_records.forEach(purchase => {
        const sellerId = purchase.seller_id;
        
        if (!sellersStats[sellerId]) return;
        
        // Обрабатываем каждый товар в чеке
        purchase.items.forEach(item => {
            const productSku = item.sku;
            const product = productsIndex[productSku];
            
            if (!product) return;
            
            // Вычисляем выручку
            const revenue = calculateRevenue({
                discount: item.discount,
                sale_price: item.sale_price,
                quantity: item.quantity
            }, product);
            
            // В реальных данных себестоимость называется purchase_price
            const cost = product.purchase_price * item.quantity;
            const profit = revenue - cost;
            
            // Обновляем статистику
            const sellerStats = sellersStats[sellerId];
            sellerStats.revenue += revenue;
            sellerStats.profit += profit;
            sellerStats.sales_count += 1;
            
            if (!sellerStats.products_sold[productSku]) {
                sellerStats.products_sold[productSku] = 0;
            }
            sellerStats.products_sold[productSku] += item.quantity;
        });
    });
    
    // Преобразуем в массив и сортируем
    const sellersArray = Object.values(sellersStats);
    sellersArray.sort((a, b) => b.profit - a.profit);
    
    // Назначаем премии
    const totalSellers = sellersArray.length;
    const result = sellersArray.map((seller, index) => {
        const bonusRate = calculateBonus(index, totalSellers, seller);
        const bonusAmount = seller.profit * bonusRate;
        
        return {
            ...seller,
            bonus_rate: bonusRate,
            bonus_amount: bonusAmount,
            position: index + 1
        };
    });
    
    // Подготовка итоговой коллекции
    const finalResult = result.map(seller => {
        const topProducts = Object.entries(seller.products_sold)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([sku, quantity]) => ({
                article: sku,
                quantity,
                product_name: productsIndex[sku] ? productsIndex[sku].name : 'Неизвестный товар'
            }));
        
        return {
            seller_id: seller.id,
            name: seller.name,
            revenue: parseFloat(seller.revenue.toFixed(2)),
            profit: parseFloat(seller.profit.toFixed(2)),
            sales_count: seller.sales_count,
            bonus: parseFloat(seller.bonus_amount.toFixed(2)),
            top_products: topProducts
        };
    });
    
    return finalResult;
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateSimpleRevenue,
        calculateBonusByProfit,
        analyzeSalesData
    };
}