const ordersTable = document.getElementById('orders-table').getElementsByTagName('tbody')[0];
const orderForm = document.getElementById('form-order');
const orderFormTitle = document.getElementById('form-title-order');

// Загрузка заказов
async function loadOrders() {
    try {
        const response = await fetch('/api/ordersadmin');
        if (!response.ok) throw new Error('Ошибка при загрузке заказов');

        const orders = await response.json();
        ordersTable.innerHTML = ''; // Очистка текущей таблицы

        orders.forEach(order => {
            const row = ordersTable.insertRow();
            row.insertCell(0).innerText = order.order_date; // Дата заказа
            row.insertCell(1).innerText = order.status; // Статус
            row.insertCell(2).innerText = order.first_name || 'Не указан'; // Имя клиента
            row.insertCell(3).innerText = order.last_name || 'Не указана'; // Фамилия клиента
            row.insertCell(4).innerText = order.address || 'Не указан'; // Адрес клиента
            row.insertCell(5).innerText = order.phone_number || 'Не указан'; // Номер телефона клиента
            row.insertCell(6).innerText = order.services.join(', ') || 'Нет услуг'; // Услуги

            const actionsCell = row.insertCell(7); // Столбец для кнопок действий
            actionsCell.innerHTML = ''; // Очистка перед добавлением кнопок

            // Кнопка "Редактировать"
            const editButton = document.createElement('button');
            editButton.innerText = 'Редактировать';
            editButton.classList.add('button', 'button-edit');
            editButton.onclick = () => editOrder(order);
            actionsCell.appendChild(editButton);

            // Кнопка "Удалить"
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Удалить';
            deleteButton.classList.add('button', 'button-delete');
            deleteButton.onclick = () => deleteOrder(order.order_id);
            actionsCell.appendChild(deleteButton);

            row.dataset.orderId = order.order_id;
        });
    } catch (error) {
        alert(error.message);
    }
}

// Редактирование заказа
function editOrder(order) {
    const modal = document.getElementById('order-modal');
    const statusField = document.getElementById('status'); // Поле для статуса

    // Устанавливаем статус заказа в форме
    statusField.value = order.status;
    modal.dataset.orderId = order.order_id; // Устанавливаем ID заказа в data атрибут

    // Устанавливаем заголовок формы
    orderFormTitle.innerText = 'Редактировать заказ';

    // Открываем модальное окно
    showModal('order-modal');
}

// Функция для отображения модального окна
// Функция для отображения модального окна
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block'; // Показываем модальное окно

    // Добавляем обработчик для клика вне модального окна, чтобы закрыть его
    window.onclick = function (event) {
        if (event.target === modal) {
            closeModal(modalId); // Закрываем модальное окно, если клик был вне его
        }
    };
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none'; // Скрываем модальное окно

    // Убираем обработчик клика на window, чтобы не сработал для других модальных окон
    window.onclick = null;
}


// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none'; // Скрываем модальное окно
}

// Обработка отправки формы заказа
orderForm.onsubmit = async (event) => {
    event.preventDefault();

    const updatedOrder = {
        status: document.getElementById('status').value // Отправляем только статус
    };

    const modal = document.getElementById('order-modal');
    const orderId = modal.dataset.orderId;

    try {
        const response = await fetch(`/api/ordersadmin/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedOrder),
        });

        if (!response.ok) throw new Error('Ошибка при сохранении заказа');

        loadOrders(); // Перезагружаем таблицу заказов
        closeModal('order-modal'); // Закрываем модальное окно
    } catch (error) {
        alert(error.message);
    }
};

// Удаление заказа
async function deleteOrder(orderId) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    try {
        const response = await fetch(`/api/ordersadmin/${orderId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ошибка при удалении заказа');

        loadOrders(); // Перезагрузка таблицы
    } catch (error) {
        alert(error.message);
    }
}

// Фильтрация заказов
function filterOrders() {
    const searchQuery = document.getElementById('search-input-order').value.toLowerCase();
    const rows = ordersTable.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const status = row.cells[1].innerText.toLowerCase(); // Статус
        const clientLastName = row.cells[3].innerText.toLowerCase(); // Фамилия клиента
        const services = row.cells[6].innerText.toLowerCase(); // Услуги

        // Фильтруем по статусу, фамилии или услугам
        if (
            status.includes(searchQuery) ||
            clientLastName.includes(searchQuery) ||
            services.includes(searchQuery) // Фильтрация по услугам
        ) {
            row.style.display = ''; // Показываем строку
        } else {
            row.style.display = 'none'; // Скрываем строку
        }
    });
}

// Вызов загрузки заказов при инициализации
loadOrders();
