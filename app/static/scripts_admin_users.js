// Получаем таблицу пользователей и форму
const usersTable = document.getElementById('users-table').getElementsByTagName('tbody')[0];
const form = document.getElementById('form-user');
const formTitle = document.getElementById('form-title-user');

// Функция для выхода
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("roleid");
    window.location.href = "/";
}

/*-----------------------------------------------------------------------------------------------------------------------*/
/* Users */

// Функция для отображения модального окна
function showUserModal(modalId, data = {}) {
    const modal = document.getElementById(modalId);

    if (modalId === "user-modal") {
        const { username, email, roleid } = data;

        if (username) {
            // Заполняем поля формы для редактирования
            document.getElementById('username').value = username;
            document.getElementById('email').value = email;
            document.getElementById('role').value = roleid;
            formTitle.innerText = 'Редактировать пользователя';
            modal.dataset.userId = username; // Устанавливаем идентификатор для редактирования
        } else {
            // Очищаем поля формы для добавления нового пользователя
            form.reset();
            formTitle.innerText = 'Добавить пользователя';
            delete modal.dataset.userId; // Убираем идентификатор, если добавляем
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

// Функция для загрузки всех пользователей
async function loadUsers() {
    const response = await fetch('/api/users');
    const users = await response.json();
    usersTable.innerHTML = ''; // Очищаем таблицу

    users.forEach(user => {
        const row = usersTable.insertRow();
        row.insertCell(0).innerText = user.username;
        row.insertCell(1).innerText = user.email;
        row.insertCell(2).innerText = user.roleid === 1 ? 'Пользователь' : 'Администратор';

        const actionsCell = row.insertCell(3);

        // Кнопка редактирования
        const editButton = document.createElement('button');
        editButton.innerText = 'Редактировать';
        editButton.classList.add('button', 'button-edit');
        editButton.onclick = () => editUser(user);
        actionsCell.appendChild(editButton);

        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Удалить';
        deleteButton.classList.add('button', 'button-delete');
        deleteButton.onclick = () => deleteUser(user.username);
        actionsCell.appendChild(deleteButton);
    });

    // После загрузки данных применяем фильтрацию
    filterUsers();
}

// Функция для редактирования пользователя
function editUser(user) {
    showUserModal('user-modal', {
        username: user.username,
        email: user.email,
        roleid: user.roleid
    });
}

// Функция для удаления пользователя
async function deleteUser(username) {
    if (confirm('Вы уверены, что хотите удалить пользователя?')) {
        const response = await fetch(`/api/users/${username}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadUsers();
        } else {
            alert('Ошибка при удалении пользователя');
        }
    }
}

// Функция для фильтрации пользователей по имени или email
function filterUsers() {
    const searchQuery = document.getElementById('search-input-user').value.toLowerCase();
    const rows = usersTable.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const username = row.cells[0].innerText.toLowerCase();
        const email = row.cells[1].innerText.toLowerCase();

        if (username.includes(searchQuery) || email.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Обработчик отправки формы для добавления/редактирования пользователя
form.onsubmit = async (event) => {
    event.preventDefault();

    const newUser = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        roleid: document.getElementById('role').value
    };

    const modal = document.getElementById('user-modal');
    const userId = modal.dataset.userId; // Проверяем, есть ли идентификатор пользователя

    const method = userId ? 'PUT' : 'POST';
    const url = userId ? `/api/users/${userId}` : '/api/users';

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    });

    if (response.ok) {
        loadUsers();
        closeModal('user-modal');
    } else {
        alert('Ошибка при сохранении пользователя');
    }
};

// Инициализация загрузки пользователей
loadUsers();