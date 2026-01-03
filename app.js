// Состояние приложения
let tickets = [];
let currentIndex = 0;
let studiedTickets = new Set();

// Элементы DOM
const card = document.getElementById('card');
const cardInner = document.getElementById('cardInner');
const ticketNumber = document.getElementById('ticketNumber');
const question = document.getElementById('question');
const answer = document.getElementById('answer');
const flipBtn = document.getElementById('flipBtn');
const skipBtn = document.getElementById('skipBtn');
const counter = document.getElementById('counter');
const progressFill = document.getElementById('progressFill');
const studiedCount = document.getElementById('studiedCount');
const remainingCount = document.getElementById('remainingCount');
const loading = document.getElementById('loading');

// Загрузка данных
async function loadData() {
    try {
        const response = await fetch('tickets.json');
        if (!response.ok) {
            throw new Error('Файл tickets.json не найден');
        }
        tickets = await response.json();
        
        // Проверяем структуру данных
        if (!Array.isArray(tickets) || tickets.length === 0) {
            throw new Error('Данные не найдены или файл пуст');
        }
        
        // Загружаем прогресс из localStorage
        const savedProgress = localStorage.getItem('studiedTickets');
        if (savedProgress) {
            studiedTickets = new Set(JSON.parse(savedProgress));
        }
        
        const savedIndex = localStorage.getItem('currentIndex');
        if (savedIndex) {
            currentIndex = parseInt(savedIndex, 10);
            if (currentIndex >= tickets.length) {
                currentIndex = 0;
            }
        }
        
        updateDisplay();
        loading.classList.add('hidden');
    } catch (error) {
        loading.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="font-size: 18px; margin-bottom: 15px;">Ошибка загрузки данных</p>
                <p style="font-size: 14px; opacity: 0.9;">${error.message}</p>
                <p style="font-size: 14px; opacity: 0.8; margin-top: 20px;">
                    Убедитесь, что файл tickets.json находится в той же папке
                </p>
            </div>
        `;
        console.error('Ошибка загрузки данных:', error);
    }
}

// Функция для получения значения из объекта с учетом разных вариантов названий
function getValue(ticket, possibleKeys, allowEmpty = false) {
    // Сначала ищем точное совпадение
    for (const key of possibleKeys) {
        if (ticket.hasOwnProperty(key)) {
            const value = ticket[key];
            if (allowEmpty || (value !== undefined && value !== null && value !== '')) {
                return value !== null && value !== undefined ? String(value) : '';
            }
        }
    }
    // Пробуем найти по ключу без учета регистра
    const lowerKeys = Object.keys(ticket).map(k => k.toLowerCase());
    for (const key of possibleKeys) {
        const lowerKey = key.toLowerCase();
        const index = lowerKeys.indexOf(lowerKey);
        if (index !== -1) {
            const value = ticket[Object.keys(ticket)[index]];
            if (allowEmpty || (value !== undefined && value !== null && value !== '')) {
                return value !== null && value !== undefined ? String(value) : '';
            }
        }
    }
    return allowEmpty ? '' : null;
}

// Обновление отображения
function updateDisplay(resetFlip = true) {
    if (tickets.length === 0) return;
    
    const ticket = tickets[currentIndex];
    
    // Обновляем содержимое карточки с гибкой обработкой названий столбцов
    // Для ответа разрешаем пустые значения
    const ticketNum = getValue(ticket, ['Номер билета', 'номер билета', 'Номер', 'номер', 'Билет', 'билет']) || (currentIndex + 1);
    const questionText = getValue(ticket, ['Вопрос', 'вопрос', 'Question', 'question']) || 'Вопрос не найден';
    const answerText = getValue(ticket, ['Ответ', 'ответ', 'Answer', 'answer'], true) || ''; // Разрешаем пустые ответы
    
    ticketNumber.textContent = `Билет № ${ticketNum}`;
    question.textContent = questionText;
    
    // Обрабатываем ответ
    if (!answerText || answerText.trim() === '') {
        answer.textContent = '(Ответ пока не добавлен)';
        answer.classList.add('empty-answer');
    } else {
        answer.textContent = answerText;
        answer.classList.remove('empty-answer');
    }
    
    // Сбрасываем переворот карточки только если нужно
    if (resetFlip) {
        card.classList.remove('flipped');
    }
    
    // Обновляем счетчик
    counter.textContent = `${currentIndex + 1} / ${tickets.length}`;
    
    // Обновляем прогресс
    const progress = ((currentIndex + 1) / tickets.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Обновляем статистику
    studiedCount.textContent = studiedTickets.size;
    remainingCount.textContent = tickets.length - studiedTickets.size;
    
    // Сохраняем текущий индекс
    localStorage.setItem('currentIndex', currentIndex.toString());
}

// Переворот карточки
function flipCard() {
    card.classList.toggle('flipped');
    
    // Если карточка перевернута, отмечаем билет как изученный
    if (card.classList.contains('flipped')) {
        studiedTickets.add(currentIndex);
        localStorage.setItem('studiedTickets', JSON.stringify([...studiedTickets]));
        // Обновляем только статистику, не сбрасывая переворот
        studiedCount.textContent = studiedTickets.size;
        remainingCount.textContent = tickets.length - studiedTickets.size;
    }
}

// Следующий билет
function nextTicket() {
    currentIndex = (currentIndex + 1) % tickets.length;
    updateDisplay();
}

// Обработчики событий
flipBtn.addEventListener('click', flipCard);
skipBtn.addEventListener('click', nextTicket);

// Поддержка свайпов на мобильных устройствах
let touchStartX = 0;
let touchEndX = 0;

card.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

card.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Свайп влево - следующий билет
            nextTicket();
        } else {
            // Свайп вправо - перевернуть карточку
            flipCard();
        }
    }
}

// Поддержка клавиатуры для десктопа
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextTicket();
    } else if (e.key === 'ArrowLeft' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
    }
});

// Инициализация
loadData();

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker зарегистрирован:', registration);
            })
            .catch(error => {
                console.log('Ошибка регистрации ServiceWorker:', error);
            });
    });
}

