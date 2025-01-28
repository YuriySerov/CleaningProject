// Получаем таблицу сотрудников и форму
const employeesTable = document.getElementById('employees-table').getElementsByTagName('tbody')[0];
const employeeForm = document.getElementById('form-employee');
const employeeFormTitle = document.getElementById('form-title-employee');

// Функция для выхода
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("roleid");
    window.location.href = "/";
}

/*-----------------------------------------------------------------------------------------------------------------------*/
/* Employees */

// Функция для отображения модального окна
function showEmployeeModal(modalId, data = {}) {
    const modal = document.getElementById(modalId);

    if (modalId === "employee-modal") {
        const { first_name, last_name, position, hire_date, email, phone, photo, employee_id } = data;

        if (first_name) {
            // Заполняем поля формы для редактирования
            document.getElementById('first-name').value = first_name || '';
            document.getElementById('last-name').value = last_name || '';
            document.getElementById('position').value = position || '';
            document.getElementById('hire-date').value = hire_date ? new Date(hire_date).toISOString().split('T')[0] : '';
            document.getElementById('emailemployee').value = email || '';
            document.getElementById('phone').value = phone || '';
            employeeFormTitle.innerText = 'Редактировать сотрудника';
            modal.dataset.employeeId = employee_id; // Устанавливаем идентификатор для редактирования
        } else {
            // Очистка полей формы для добавления нового сотрудника
            employeeForm.reset();
            employeeFormTitle.innerText = 'Добавить сотрудника';
            delete modal.dataset.employeeId; // Убираем идентификатор, если добавляем
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

// Функция для загрузки всех сотрудников
async function loadEmployees() {
    const response = await fetch('/api/employeesadmin');
    const employees = await response.json();
    employeesTable.innerHTML = ''; // Очищаем таблицу

    employees.forEach(employee => {
        const row = employeesTable.insertRow();
        row.insertCell(0).innerText = employee.first_name;
        row.insertCell(1).innerText = employee.last_name;
        row.insertCell(2).innerText = employee.position || '-';
        row.insertCell(3).innerText = employee.hire_date || '-';
        row.insertCell(4).innerText = employee.email || '-';
        row.insertCell(5).innerText = employee.phone || '-';

        const photoCell = row.insertCell(6);
        photoCell.innerText = employee.photo || '-';

        const actionsCell = row.insertCell(7);

        // Кнопка редактирования
        const editButton = document.createElement('button');
        editButton.innerText = 'Редактировать';
        editButton.classList.add('button', 'button-edit');
        editButton.onclick = () => showEmployeeModal('employee-modal', {
            first_name: employee.first_name,
            last_name: employee.last_name,
            position: employee.position,
            hire_date: employee.hire_date,
            email: employee.email,
            phone: employee.phone,
            photo: employee.photo,
            employee_id: employee.employee_id
        });
        actionsCell.appendChild(editButton);

        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Удалить';
        deleteButton.classList.add('button', 'button-delete');
        deleteButton.onclick = () => deleteEmployee(employee.employee_id);
        actionsCell.appendChild(deleteButton);
    });

    // После загрузки данных применяем фильтрацию
    filterEmployees();
}

// Функция для удаления сотрудника
async function deleteEmployee(employeeId) {
    if (confirm('Вы уверены, что хотите удалить сотрудника?')) {
        const response = await fetch(`/api/employeesadmin/${employeeId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadEmployees();
        } else {
            alert('Ошибка при удалении сотрудника');
        }
    }
}

// Функция для фильтрации сотрудников по имени или должности
function filterEmployees() {
    const searchQuery = document.getElementById('search-input-employee').value.toLowerCase();
    const rows = employeesTable.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const firstName = row.cells[0].innerText.toLowerCase();
        const lastName = row.cells[1].innerText.toLowerCase();
        const position = row.cells[2].innerText.toLowerCase();

        if (firstName.includes(searchQuery) || lastName.includes(searchQuery) || position.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Обработчик отправки формы для добавления/редактирования сотрудника
employeeForm.onsubmit = async (event) => {
    event.preventDefault();

    // Получаем имя файла без пути
    const photoInput = document.getElementById('photo');
    let photo = '';
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        photo = file.name.split('/').pop(); // Урезаем путь до имени файла
    }

    const newEmployee = {
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
        position: document.getElementById('position').value,
        hire_date: document.getElementById('hire-date').value,
        email: document.getElementById('emailemployee').value,
        phone: document.getElementById('phone').value,
        photo: photo // Отправляем только имя файла
    };

    const modal = document.getElementById('employee-modal');
    const employeeId = modal.dataset.employeeId; // Проверяем, есть ли идентификатор сотрудника

    const method = employeeId ? 'PUT' : 'POST';
    const url = employeeId ? `/api/employeesadmin/${employeeId}` : '/api/employeesadmin';

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployee)
    });

    if (response.ok) {
        loadEmployees();
        closeModal('employee-modal');
    } else {
        alert('Ошибка при сохранении сотрудника');
    }
};

// Инициализация загрузки сотрудников
loadEmployees();

// Обработчик кнопки для создания нового сотрудника
document.getElementById('create-employee-button').onclick = () => {
    // Открыть модальное окно для создания нового сотрудника
    showEmployeeModal('employee-modal');
};
