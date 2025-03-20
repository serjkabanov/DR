document.addEventListener('DOMContentLoaded', async () => {
    const GOOGLE_SHEET_JSON_URL = 'https://sheets.googleapis.com/v4/spreadsheets/1Qd0Q7CbucpJdYDjuFbDl5sRqXOeafUBDHgaLqRHCxFY/values/GiftsData?alt=json&key=AIzaSyA1UzERW7ZnB4ltC5d9EzOrHFsbx0AVjv4'; // Вставьте сюда URL для JSON
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyN7ONtfiR-RiFAnUISa6PGvRzscXWCXhde0up3IMlTP4X04OZ_ePYc0BKRr3wICnXY/exec'; // Вставьте сюда URL веб-приложения

    let gifts = [];
    let selectedGifts = [];

    // Load gifts from the Google Sheet (JSON)
    const loadGifts = async () => {
        try {
            const response = await fetch(GOOGLE_SHEET_JSON_URL);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            gifts = data.values.slice(1).map(row => ({ // Пропускаем первую строку (заголовки)
                id: parseInt(row[0]),         // Столбец A (id)
                name: row[1],       // Столбец B (name)
                price: parseFloat(row[2]),    // Столбец C (price)
                link: row[3],        // Столбец D (link)
                image: row[4],       // Столбец E (image)
                reserved: row[5] === 'TRUE' || row[5] === true // Столбец F (reserved) - обрабатываем и строку 'TRUE' и boolean true
            }));
            renderGiftList();
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    };

    // Render the gift list
    const renderGiftList = () => {
        const tbody = document.querySelector('#giftList tbody');
        tbody.innerHTML = '';

        gifts.forEach((gift, index) => {
            if (!gift.reserved) {
                const row = `
                    <tr>
                        <td>${gift.id}</td>
                        <td><img src="${gift.image}" alt="${gift.name}" style="max-width: 100px;"></td>
                        <td>${gift.name}</td>
                        <td>${gift.price} ₽</td>
                        <td><a href="${gift.link}" target="_blank">Ссылка</a></td>
                        <td>
                            <button class="reserve-btn" data-index="${index}">Я подарю</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        });

        document.querySelectorAll('.reserve-btn').forEach(button => {
            button.addEventListener('click', handleReserve);
        });
    };

    // Handle "Reserve" button click
    const handleReserve = (event) => {
        const index = event.target.getAttribute('data-index');
        const gift = gifts[index];

        if (!selectedGifts.includes(index)) {
            selectedGifts.push(index);
            updateSelectedGiftsList();
            document.getElementById('confirmButton').disabled = false;
        }

        event.target.disabled = true;
    };

    // Update the list of selected gifts
    const updateSelectedGiftsList = () => {
        const ul = document.getElementById('selectedGifts');
        ul.innerHTML = '';

        selectedGifts.forEach(index => {
            const gift = gifts[index];
            const li = document.createElement('li');
            li.textContent = `${gift.name} (${gift.price} ₽)`;
            ul.appendChild(li);
        });
    };

    // Confirm selection (update gifts in Google Sheet using Apps Script)
    document.getElementById('confirmButton').addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите подтвердить выбор?')) {
            selectedGifts.forEach(index => {
                gifts[index].reserved = true;
            });

            try {
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(gifts) // Отправляем весь массив gifts
                });

                if (response.ok) {
                    alert('Список успешно обновлен в Google Таблице!');
                    selectedGifts = [];
                    document.getElementById('confirmButton').disabled = true;
                    // loadGifts(); // Можно раскомментировать, чтобы сразу обновить таблицу на странице
                } else {
                    alert('Ошибка при обновлении списка в Google Таблице.');
                    const errorData = await response.json();
                    console.error('Google Apps Script error:', errorData);
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
        }
    });

    // Start the process
    loadGifts();
});
