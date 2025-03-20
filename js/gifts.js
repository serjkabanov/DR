document.addEventListener('DOMContentLoaded', async () => {
    const GITHUB_REPO = 'serjkabanov/DR';
    const GITHUB_FILE_PATH = 'data/gifts.json';

    let gifts = [];
    let selectedGifts = [];

    // Загрузка данных из GitHub
    const loadGifts = async () => {
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
                headers: {
                    'User-Agent': 'GiftListApp' // Добавляем User-Agent для совместимости с GitHub API
                }
            });
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.content) {
                const decodedContent = atob(data.content); // Декодируем Base64
                gifts = JSON.parse(decodedContent);
                renderGiftList();
            } else {
                console.error('No content found in the response');
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    };

    // Отображение списка подарков
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

    // Обработка нажатия "Я подарю"
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

    // Обновление списка отмеченных подарков
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

    // Подтверждение выбора (без обновления файла на GitHub)
    document.getElementById('confirmButton').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите подтвердить выбор?')) {
            selectedGifts.forEach(index => {
                gifts[index].reserved = true; // Обновляем локально
            });
            alert('Выбор подтвержден! Обновите файл gifts.json вручную на GitHub.');
            selectedGifts = [];
            document.getElementById('confirmButton').disabled = true;
            renderGiftList(); // Перерисовываем список
        }
    });

    // Инициализация
    loadGifts();
});
