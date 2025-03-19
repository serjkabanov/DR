// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Данные о блюдах
    const dishes = {
        hot: [
            "КУРИНОЕ ФИЛЕ ЗАПЕЧЕННОЕ ПО-ДЕРЕВЕНСКИ С КАРТОШКОЙ",
            "ДОЛМА С ГОВЯДИНОЙ",
            "ПАСТА С КУРИЦЕЙ И ГРИБАМИ",
            "МЯСО ПО-ФРАНЦУЗСКИ С КУРИЦЕЙ",
            "ОТБИВНАЯ КУРИНАЯ С ПОМИДОРАМИ И СЫРОМ И МАКАРОНАМИ",
            "ОТБИВНАЯ КУРИНАЯ С КАРТОФЕЛЬНЫМ ПЮРЕ",
            "ГУЛЯШ ИЗ ГОВЯДИНЫ С ГРЕЧКОЙ",
            "ФИЛЕ ГОРБУШИ С РИСОМ",
            "УЙГУРСКИЙ ЛАГМАН С ГОВЯДИНОЙ",
            "ПОДЖАРКА ИЗ СВИНИНЫ С МАКАРОНАМИ",
            "ФИЛЕ КУРИНОЕ В СМЕТАННОМ СОУСЕ С РИСОМ",
            "ГОЛЕНЬ КУРИНАЯ И РИС ЦВЕТНОЙ"
        ],
        salads: [
            "САЛАТ ЦЕЗАРЬ С КУРИНЫМ ФИЛЕ",
            "САЛАТ ОВОЩНОЙ ПО-ДОМАШНЕМУ СО СМЕТАНОЙ",
            "САЛАТ ОВОЩНОЙ ПО-ДОМАШНЕМУ С МАСЛОМ",
            "САЛАТ ИЗ КРАБОВЫХ ПАЛОЧЕК",
            "САЛАТ СЕЛЬДЬ ПОД ШУБОЙ",
            "САЛАТ ОЛИВЬЕ С КОЛБАСОЙ",
            "САЛАТ БАВАРСКИЙ",
            "САЛАТ ГРЕЧЕСКИЙ",
            "САЛАТ ВИТАМИННЫЙ MIX"
        ],
        lepeshka: ["Лепешка"]
    };

    // Генерация блюд
    const renderDishes = (containerId, dishType) => {
        const container = document.getElementById(containerId);
        dishes[dishType].forEach(dish => {
            const imagePath = `picture/${encodeURIComponent(dish)}.webp`;
            const html = `
                <div class="dish-item">
                    <img src="${imagePath}" alt="${dish}">
                    <div>
                        <span>${dish}</span>
                        <input type="number" name="${dish}" min="0" value="0" class="dish-quantity">
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });
    };

    renderDishes('hotDishes', 'hot');
    renderDishes('salads', 'salads');
    renderDishes('lepeshka', 'lepeshka');

    // Обновление корзины
    const updateCart = () => {
        const cartItems = document.getElementById('cartItems');
        const orderData = document.getElementById('orderData');
        const formData = new FormData(document.getElementById('rsvpForm'));
        
        // Собираем данные
        const order = {};
        formData.forEach((value, key) => {
            if (key !== 'name' && key !== 'order' && parseInt(value) > 0) {
                order[key] = value;
            }
        });

        // Отрисовываем корзину
        cartItems.innerHTML = Object.entries(order)
            .map(([dish, qty]) => `<li>${dish}: ${qty} порц.</li>`)
            .join('');

        // Обновляем скрытое поле
        orderData.value = JSON.stringify(order);
    };

    // Слушаем изменения
    document.querySelectorAll('.dish-quantity').forEach(input => {
        input.addEventListener('change', updateCart);
    });
});