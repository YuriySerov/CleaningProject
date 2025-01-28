// Получаем таблицу услуг и форму
const servicesTable = document.getElementById('services-table').getElementsByTagName('tbody')[0];
const serviceForm = document.getElementById('form-services');
const formTitleService = document.getElementById('form-title-services');

// Функция для выхода
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("roleid");
    window.location.href = "/";
}

/*-----------------------------------------------------------------------------------------------------------------------*/
/* Services */

// Функция для отображения модального окна
function showServiceModal(modalId, data = {}) {
    const modal = document.getElementById(modalId);

    if (modalId === "service-modal") {
        const { ServiceName, Description, Price, Duration, ServiceID } = data;

        if (ServiceName) {
            // Заполняем поля формы для редактирования
            document.getElementById('service-name').value = ServiceName;
            document.getElementById('description').value = Description;
            document.getElementById('price').value = Price;
            document.getElementById('duration').value = Duration;
            formTitleService.innerText = 'Редактировать услугу';
            modal.dataset.serviceId = ServiceID; // Устанавливаем идентификатор для редактирования
        } else {
            // Очищаем поля формы для добавления новой услуги
            serviceForm.reset();
            formTitleService.innerText = 'Добавить услугу';
            delete modal.dataset.serviceId; // Убираем идентификатор, если добавляем
        }
    }

    modal.style.display = "block";

    // Закрытие модального окна при клике на крестик
    modal.querySelector(".close").onclick = () => closeModal(modalId);

    // Закрытие при клике вне модального окна
    window.onclick = (event) => {
        if (event.target === modal) closeModal(modalId);
    };
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Функция для загрузки всех услуг
async function loadServices() {
    const response = await fetch('/api/services');
    const services = await response.json();
    servicesTable.innerHTML = ''; // Очищаем таблицу

    services.forEach(service => {
        const row = servicesTable.insertRow();
        row.insertCell(0).innerText = service.name;  // Используем "name" вместо "ServiceName"
        row.insertCell(1).innerText = service.description;  // Используем "description"
        row.insertCell(2).innerText = service.price;  // Используем "price"
        row.insertCell(3).innerText = service.duration;  // Используем "duration"

        const actionsCell = row.insertCell(4);

        // Кнопка редактирования
        const editButton = document.createElement('button');
        editButton.innerText = 'Редактировать';
        editButton.classList.add('button', 'button-edit');
        editButton.onclick = () => editService(service);  // Используем обновленное название поля
        actionsCell.appendChild(editButton);

        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Удалить';
        deleteButton.classList.add('button', 'button-delete');
        deleteButton.onclick = () => deleteService(service.id);  // Используем "id" вместо "ServiceID"
        actionsCell.appendChild(deleteButton);
    });

    // После загрузки данных применяем фильтрацию
    filterServices();
}

// Функция для редактирования услуги
function editService(service) {
    showServiceModal('service-modal', {
        ServiceName: service.name,  // Используем "name" вместо "ServiceName"
        Description: service.description,  // Используем "description"
        Price: service.price,  // Используем "price"
        Duration: service.duration,  // Используем "duration"
        ServiceID: service.id  // Используем "id" вместо "ServiceID"
    });
}

// Функция для удаления услуги
async function deleteService(serviceId) {
    if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadServices();
        } else {
            alert('Ошибка при удалении услуги');
        }
    }
}

// Функция для фильтрации услуг по названию или описанию
function filterServices() {
    const searchQuery = document.getElementById('search-input-services').value.toLowerCase();
    const rows = servicesTable.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const serviceName = row.cells[0].innerText.toLowerCase();
        const description = row.cells[1].innerText.toLowerCase();

        if (serviceName.includes(searchQuery) || description.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Обработчик отправки формы для добавления/редактирования услуги
serviceForm.onsubmit = async (event) => {
    event.preventDefault();

    const newService = {
        name: document.getElementById('service-name').value,  // Используем "name" вместо "ServiceName"
        description: document.getElementById('description').value,  // Используем "description"
        price: parseFloat(document.getElementById('price').value),  // Используем "price"
        duration: document.getElementById('duration').value  // Используем "duration"
    };

    const modal = document.getElementById('service-modal');
    const serviceId = modal.dataset.serviceId; // Проверяем, есть ли идентификатор услуги

    const method = serviceId ? 'PUT' : 'POST';
    const url = serviceId ? `/api/services/${serviceId}` : '/api/services';

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newService)
    });

    if (response.ok) {
        loadServices();
        closeModal('service-modal');
    } else {
        alert('Ошибка при сохранении услуги');
    }
};


// Инициализация загрузки услуг
loadServices();
