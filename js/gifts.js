document.addEventListener('DOMContentLoaded', async () => {
    const GITHUB_REPO = 'ваш-репозиторий';
    const GITHUB_FILE_PATH = 'data/gifts.json';
    const GITHUB_TOKEN = 'ваш-github-token'; // Токен для доступа к GitHub API

    let gifts = [];
    let selectedGifts = [];

    // Загрузка данных из GitHub
    const loadGifts = async () => {
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`);
            const data = await response.json();
            const decodedContent = atob(data.content); // Декодируем Base64
            gifts = JSON.parse(decodedContent);
            renderGiftList();
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

    // Подтверждение выбора
    document.getElementById('confirmButton').addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите подтвердить выбор?')) {
            selectedGifts.forEach(index => {
                gifts[index].reserved = true;
            });

            try {
                const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Обновление списка подарков',
                        content: btoa(JSON.stringify(gifts, null, 2)),
                        sha: await getFileSHA()
                    })
                });

                if (response.ok) {
                    alert('Список успешно обновлен!');
                    selectedGifts = [];
                    document.getElementById('confirmButton').disabled = true;
                    loadGifts();
                } else {
                    alert('Ошибка при обновлении списка.');
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
        }
    });

    // Получение SHA файла
    const getFileSHA = async () => {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`);
        const data = await response.json();
        return data.sha;
    };

    // Инициализация
    loadGifts();
});
