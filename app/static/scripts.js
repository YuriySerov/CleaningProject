// Получение контейнера для услуг
const servicesContainer = document.getElementById("services-container");
const employeesContainer = document.getElementById("employees-container"); // Контейнер для сотрудников

// Функция для загрузки услуг
async function loadServices() {
  try {
    const response = await fetch("/api/services");
    if (!response.ok) throw new Error("Ошибка загрузки услуг");

    const services = await response.json();

    // Очистка контейнера
    servicesContainer.innerHTML = "";

    // Добавление услуг в контейнер
    services.forEach((service) => {
      const serviceElement = document.createElement("div");
      serviceElement.classList.add("service");
      serviceElement.innerHTML = `
        <h3>${service.name}</h3>
        <p><strong>Цена:</strong> ${service.price} руб/квадратный метр</p>
        <button class="details-button" data-id="${service.id}" data-description="${service.description}" data-duration="${service.duration}" data-reviews='${JSON.stringify(service.reviews)}'>
          Подробнее
        </button>
        <button class="order-button" data-id="${service.id}">
          Оформить заказ
        </button>
      `;
      servicesContainer.appendChild(serviceElement);
    });

    // Добавление обработчиков
    addEventListeners();
  } catch (error) {
    servicesContainer.innerHTML = `<p class="error">Не удалось загрузить услуги. Попробуйте позже.</p>`;
    console.error("Ошибка:", error);
  }
}

async function loadEmployees() {
  try {
    const response = await fetch("/api/employees");
    if (!response.ok) throw new Error("Ошибка загрузки сотрудников");

    const data = await response.json();
    //console.log("Данные сотрудников:", data); // Логируем данные для отладки

    // Проверьте, что data действительно является массивом
    const employees = Array.isArray(data) ? data : []; // Убедитесь, что ключ соответствует возвращаемым данным

    // Очистка контейнера
    employeesContainer.innerHTML = "";

    // Добавление сотрудников в контейнер
    employees.forEach((employee) => {
      //console.log("Сотрудник:", employee); // Логируем каждого сотрудника для отладки
      const employeeElement = document.createElement("div");
      employeeElement.classList.add("employee");
      employeeElement.innerHTML = `
        <img src="${employee.photo}" alt="${employee.first_name} ${employee.last_name}" class="employee-photo">
        <h3>${employee.first_name} ${employee.last_name}</h3>
        <p><strong>Должность:</strong> ${employee.position || "Не указана"}</p>
        <p><strong>Email:</strong> ${employee.email}</p>
        <p><strong>Телефон:</strong> ${employee.phone || "Не указан"}</p>
      `;
      employeesContainer.appendChild(employeeElement);
    });
  } catch (error) {
    console.error("Ошибка:", error);
    employeesContainer.innerHTML = `<p class="error">Не удалось загрузить сотрудников. Попробуйте позже.</p>`;
  }
}


// Загрузка данных при загрузке страницы
window.addEventListener("load", () => {
  loadEmployees();
});


// Добавление обработчиков событий
function addEventListeners() {
  document.querySelectorAll(".details-button").forEach((button) =>
    button.addEventListener("click", () => {
      const description = button.getAttribute("data-description");
      const duration = button.getAttribute("data-duration");
      const reviews = JSON.parse(button.getAttribute("data-reviews"));
      showModal("details-modal", { description, duration, reviews });
    })
  );

  document.querySelectorAll(".order-button").forEach((button) =>
    button.addEventListener("click", () => {
      const serviceId = button.getAttribute("data-id");
      showModal("order-modal", { serviceId });
    })
  );
}

// Универсальная функция для отображения модальных окон
function showModal(modalId, data = {}) {
  const modal = document.getElementById(modalId);

  if (modalId === "details-modal") {
    const { description, duration, reviews } = data;
    let reviewsHtml = '';

    if (reviews && reviews.length > 0) {
      reviewsHtml = reviews.map(review => `
        <p><strong>${review.username || 'Неизвестный пользователь'}:</strong> 
        <span>Рейтинг: ${review.rating || 'Не указан'}</span><br>
        ${review.comment}
        </p>
      `).join('');
    } else {
      reviewsHtml = '<p>Нет отзывов.</p>';
    }

    modal.querySelector(".modal-content").innerHTML = `
      <span class="close">&times;</span> <!-- Крестик -->
      <h3>Описание</h3>
      <p>${description || "Описание отсутствует."}</p>
      <p><strong>Длительность:</strong> ${duration || "Не указана"}</p>
      <hr>
      <h4>Отзывы</h4>
      <div class="reviews">${reviewsHtml}</div>
    `;
  } else if (modalId === "order-modal") {
    document.getElementById("order-form").dataset.serviceId = data.serviceId;
  }

  modal.style.display = "block";

  // Добавление обработчика на крестик
  modal.querySelector(".close").onclick = () => {
    modal.style.display = "none";
  };

  // Закрытие при клике вне окна
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };
}

function closeOrderModal() {
  const modal = document.getElementById("order-modal");
  if (modal) {
    modal.style.display = "none";
  }
}


// Обработка отправки формы заказа
document.getElementById("order-form").onsubmit = async function (event) {
  event.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.serviceid = this.dataset.serviceId;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Ошибка: токен не найден. Пожалуйста, войдите в систему.");
    return;
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Заказ успешно оформлен!");
      closeOrderModal();
    } else {
      const result = await response.json();
      alert(result.detail || "Ошибка при оформлении заказа");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка при оформлении заказа");
  }
};

// Загрузка данных при загрузке страницы
window.addEventListener("load", () => {
  loadServices();
  loadEmployees();
});
