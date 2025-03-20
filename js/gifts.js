document.addEventListener('DOMContentLoaded', async () => {
    const GITHUB_RAW_URL = 'https://serjkabanov.github.io/DR/data/gifts.json';
    const GITHUB_REPO = 'serjkabanov/DR'; // Укажите ваш репозиторий
    const GITHUB_FILE_PATH = 'data/gifts.json';
    const GITHUB_TOKEN = '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'; // **Вставьте сюда ваш персональный токен доступа**

    let gifts = [];
    let selectedGifts = [];

    // Load gifts from the raw GitHub URL
    const loadGifts = async () => {
        try {
            const response = await fetch(GITHUB_RAW_URL);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
            }
            gifts = await response.json();
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

   // Confirm selection (update gifts.json on GitHub using API for PUT request)
    document.getElementById('confirmButton').addEventListener('click', async () => {
        if (confirm('Вы уверены, что хотите подтвердить выбор?')) {
            selectedGifts.forEach(index => {
                gifts[index].reserved = true;
            });

            try {
                const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `token ${GITHUB_TOKEN}`
                    },
                    body: JSON.stringify({
                        message: 'Обновление списка подарков',
                        content: btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(gifts, null, 2)))),
                        sha: await getFileSHAForUpdate()
                    })
                });
                console.log("PUT request response status:", response.status);
                console.log("PUT request response text:", response.statusText);
                if (response.ok) {
                    alert('Список успешно обновлен на GitHub!');
                    selectedGifts = [];
                    document.getElementById('confirmButton').disabled = true;
                    renderGiftList();
                } else {
                    alert('Ошибка при обновлении списка на GitHub.');
                    const errorData = await response.json();
                    console.error('GitHub API error:', errorData);
                    console.log("GitHub API error data:", errorData);
                }
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
        }
    });

    // Function to get SHA for PUT request (using GitHub API)
    const getFileSHAForUpdate = async () => {
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`
                }
            });
            console.log("getFileSHAForUpdate response status:", response.status);
            console.log("getFileSHAForUpdate response text:", response.statusText);
            const data = await response.json();
            console.log("getFileSHAForUpdate data:", data);
            return data.sha;
        } catch (error) {
            console.error('Ошибка при получении SHA:', error);
            return null;
        }
    };

    // Start the process
    loadGifts();
});
