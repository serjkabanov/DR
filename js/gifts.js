document.addEventListener('DOMContentLoaded', async () => {
    const GOOGLE_SHEET_JSON_URL = 'https://spreadsheets.google.com/feeds/list/1Qd0Q7CbucpJdYDjuFbDl5sRqXOeafUBDHgaLqRHCxFY/od6/public/values?alt=json'; // Вставьте сюда URL для JSON
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyttzp2kbfbF4GyKpV9aynUP0PJc6ltd651FhUPIrQUG-fjTNywWcEzJXDLCpbzVx-E/exec'; // Вставьте сюда URL веб-приложения

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
            gifts = data.feed.entry.map(entry => ({
                id: parseInt(entry.gsx$id.$t),
                name: entry.gsx$name.$t,
                price: parseFloat(entry.gsx$price.$t),
                link: entry.gsx$link.$t,
                image: entry.gsx$image.$t,
                reserved: entry.gsx$reserved.$t === 'true' // Преобразуем строку в boolean
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
