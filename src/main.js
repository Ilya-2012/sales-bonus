/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase) {
  // @TODO: Расчет выручки от операции
  const discountFactor = 1 - purchase.discount / 100;
  return purchase.sale_price * purchase.quantity * discountFactor;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */

function calculateBonusByProfit(index, total, seller) {
  const { profit } = seller;
  if (index === 0) {
    return 15;
  } else if (index === 1 || index === 2) {
    return 10;
  } else if (index === total - 1) {
    return 0;
  } else {
    // Для всех остальных
    return 5;
  }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */

function analyzeSalesData(data, options) {
  if (!data || !Array.isArray(data.sellers) || data.sellers.length === 0) {
    throw new Error("Некорректные входные данные");
  }

  if (typeof options === "object" || options !== null) {
    const { calculateRevenue, calculateBonus } = options;
    if (!calculateRevenue || !calculateBonus) {
      throw new Error("Какая то непонятная хрень и переменная не заданна");
    }
    if (typeof calculateRevenue !== "function") {
      throw new Error("Переменные не фуннкции!");
    }
    if (!data.purchase_records || data.purchase_records.length === 0) {
      throw new Error("Массив записей о покупках пуст");
    }
  }
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {},
  }));

  const sellerIndex = Object.fromEntries(
    sellerStats.map((item) => [item.id, item]),
  );
  const productIndex = {};
  for (const item of data.products) {
    productIndex[item.sku] = item;
  }

  data.purchase_records.forEach((record) => {
    // Чек
    const seller = sellerIndex[record.seller_id]; // Продавец
    // Увеличить количество продаж
    seller.sales_count = seller.sales_count + 1;
    // Увеличить общую сумму выручки всех продаж

    // Расчёт прибыли для каждого товара
    record.items.forEach((item) => {
      const product = productIndex[item.sku];

      // Товар
      // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
      // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
      // Посчитать прибыль: выручка минус себестоимость
      // Увеличить общую накопленную прибыль (profit) у продавца

      // 3. Теперь считаем прибыль (выручка минус себестоимость)
      seller.revenue += +calculateSimpleRevenue(item).toFixed(2);
      // Округляем ВСЁ выражение целиком на каждом шаге прибавления
      seller.profit +=
        calculateSimpleRevenue(item) - product.purchase_price * item.quantity;

      // Учёт количества проданных товаров
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
      // По артикулу товара увеличить его проданное количество у продавца
    });
  });

  // Сортируем продавцов по прибыли
  sellerStats.sort((a, b) => {
    return b.profit - a.profit;
  });

  sellerStats.forEach((seller) => {
    seller.products_sold = Object.entries(seller.products_sold);
    seller.products_sold = seller.products_sold.map(([sku, quantity]) => ({
      sku: sku,
      quantity: quantity,
    }));
    seller.products_sold.sort((a, b) => {
      return b.quantity - a.quantity;
    });
    seller.products_sold = seller.products_sold.slice(0, 10);
  });

  sellerStats.forEach((seller, index) => {
    seller.bonus =
      (seller.profit *
        calculateBonusByProfit(index, sellerStats.length, seller)) /
      100;
    seller.top_products = seller.products_sold;
  });

  // @TODO: Проверка входных данных✅
  // @TODO: Проверка наличия опций✅
  // @TODO: Подготовка промежуточных данных для сбора статистики✅
  // @TODO: Индексация продавцов и товаров для быстрого доступам✅
  // @TODO: Расчет выручки и прибыли для каждого продавца✅✅
  // @TODO: Сортировка продавцов по прибыли✅✅
  // @TODO: Назначение премий на основе ранжирования✅
  // @TODO: Подготовка итоговой коллекции с нужными ✅
  const someNum = 0;
  return sellerStats.map((seller) => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: Math.round(seller.bonus * 100) / 100
  }));
}
