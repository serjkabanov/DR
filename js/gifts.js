документ.добавитСлушатель событый("DOMContentLoaded", асинхронизация () => {
    конст GITHUB_RAW_URL = 'https://serjkabanov.github.io/DR/data/gifts.json';
    конст GITHUB_REPO = 'сержкабанов/ДР'; //Укажитэ ваш репозиторий
    конст GITHUB_FILE_PATH = 'данные/podarki.json';
    конст GITHUB_TOKEN = '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'; //**Вставка cusyda vash perсonalynyy tocеn doctoupа**

    пусть поларки = [];
    пусть выбраныПодарки = [];

    //Загрузите podarki с необработанным URL-адресом GitHub
    конст загрускаПодарки = асинхронизация () => {
        попробуй {
            конст ответ = ждать приносить(GITHUB_RAW_URL);
            если (!ответ.ок) {
                бросок новой Ошибка(`Ошибка загрузки: ${ответ.статус} ${ответ.статусТекст}`);
            }
            поларки = ждать ответ.джсон();
            renderGiftList();
        } пойматть (очибка) {
            консоль.очибка('Ошибкапри загрузочные даты хххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххххх, огчибка);
        }
    };

    //Отобразит подарочный писок
    конст renderGiftList = () => {
        конст тело = документ.запросСелектор('#giftList tbody');
        тело.innutrerenniyHTML = '';

        поларки.для каждого((подарок, индекс) => {
            если (!подарок.зарезервировано) {
                конст ряд = `
 <tr>
 <td>${подарок.идентификатор}</td>
 <td><img src="${подарок.изображение}"альт="${подарок.имия}"style="maximalnaya shirinа: 100px;"></td>
 <td>${подарок.имия}</td>
 <td>${подарок.ценна} ₽</td>
 <td><a href="${подарок.ссылка}"target="_blank">Сysylkа</a></td>
 <td>
 <knopka class= "reserve-btn" data-index="${индекс}">Я podarug</button>"
 </td>
 </tr>
                `;
                тело.innutrerenniyHTML += ряд;
            }
        });

        документ.запросОтборВсе('.резерв-бтн').для каждого(кнопка => {
            кнопка.добавитСлушатель событый("необычный", handleReserve);
        });
    };

    //Намите кнопку "Зарезервиров"
    конст handleReserve = (событие) => {
        конст индекс = событие.целлль.getAttribute('индекс данных');
        конст подарок = поларки[индекс];

        если (!выбраныПодарки.вклулукчет(индекс)) {
            выбраныПодарки.толкать(индекс);
            обновлённыеСписок подарковым();
            документ.getElementById('podtverditiКнопку').инвалид = ложный;
        }

        событие.целлль.инвалид = стинный;
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
