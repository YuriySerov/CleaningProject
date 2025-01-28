document.getElementById("profile-form").onsubmit = async function (event) {
  event.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Ошибка: токен не найден. Пожалуйста, войдите в систему.");
    return;
  }
  if (!confirm('Вы уверены, что хотите сохранить изменения?')) return;
  try {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Изменения сохранены!");
    } else {
      const result = await response.json();
      alert(result.detail || "Ошибка при сохранении изменений");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка при сохранении изменений");
  }
};

// Функция для отображения информации о пользователе
async function displayUserInfo() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Токен не найден. Пользователь не авторизован.");
      return;
    }

    const response = await fetch("/api/user-info", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Ошибка при получении данных пользователя");
      return;
    }

    const data = await response.json();

    const usernameElement = document.getElementById('username');
    const userEmailElement = document.getElementById('user-email');

    if (usernameElement && userEmailElement) {
      usernameElement.textContent = data.username || "Неизвестно";
      userEmailElement.textContent = data.email || "Неизвестно";
    } else {
      console.error("Элементы для отображения информации не найдены.");
    }
  } catch (error) {
    console.error("Произошла ошибка при загрузке данных пользователя:", error);
  }
}

// Функция для загрузки заказов пользователя
// Функция для загрузки заказов пользователя
async function loadUserOrders() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Токен не найден. Пользователь не авторизован.");
    return;
  }

  try {
    const response = await fetch("/api/orders-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Ошибка при загрузке заказов");
      return;
    }

    const { orders } = await response.json();
    const tableBody = document.querySelector("#orders-table tbody");

    tableBody.innerHTML = "";

    orders.forEach((order) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${order.FirstName}</td>
        <td>${order.LastName}</td>
        <td>${order.Phone}</td>
        <td>${order.Address}</td>
        <td>${order.ServiceName}</td>
        <td>${order.Price}</td>
        <td>${order.OrderDate}</td>
        <td>${order.Status}</td>
        <td>
          <button class="delete-order" data-order-id="${order.OrderID}">Удалить</button>
          <button class="leave-comment" data-order-id="${order.OrderID}">
            Оставить комментарий
          </button>
        </td>
      `;

      // Условное скрытие кнопок в зависимости от статуса
      const deleteButton = row.querySelector(".delete-order");
      const leaveCommentButton = row.querySelector(".leave-comment");

      if (order.Status === "Завершен") {
        deleteButton.style.display = "none";
        leaveCommentButton.style.display = "inline-block";
      } else {
        deleteButton.style.display = "inline-block";
        leaveCommentButton.style.display = "none";
      }

      tableBody.appendChild(row);
    });

    document.querySelectorAll(".delete-order").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const orderId = event.target.getAttribute("data-order-id");
        await deleteOrder(orderId);
        loadUserOrders();
      });
    });

  } catch (error) {
    console.error("Ошибка при загрузке заказов:", error);
  }
}

// Оставляем остальную часть кода без изменений

// Функция для удаления заказа
async function deleteOrder(orderId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Ошибка: токен не найден. Пожалуйста, войдите в систему.");
    return;
  }
  if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Заказ успешно удалён!");
    } else {
      alert("Ошибка при удалении заказа");
    }
  } catch (error) {
    console.error("Ошибка при удалении заказа:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserOrders();
  displayUserInfo();

  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("leave-comment")) {
      const orderId = event.target.dataset.orderId;
      openCommentModal(orderId);
    }
  });
});

function openCommentModal(orderId) {
  const modal = document.getElementById("comment-modal");
  modal.style.display = "block";
  const submitButton = modal.querySelector("#submit-comment");

  submitButton.onclick = async function () {
    const rating = modal.querySelector("#comment-rating").value;
    const comment = modal.querySelector("#comment-text").value;

    if (!rating || rating < 1 || rating > 5) {
      alert("Введите корректный рейтинг (1-5).");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: parseInt(rating), comment }),
      });

      if (response.ok) {
        alert("Комментарий успешно добавлен!");
        modal.style.display = "none";
      } else {
        const result = await response.json();
        alert(result.detail || "Ошибка при добавлении комментария");
      }
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
      alert("Произошла ошибка при добавлении комментария.");
    }
  };
}

// HTML for modal
const modalHtml = `
<div id="comment-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; z-index: 1000;">
  <h3>Оставить комментарий</h3>
  <label for="comment-rating">Рейтинг (1-5):</label>
  <input type="number" id="comment-rating" min="1" max="5"><br><br>
  <label for="comment-text">Комментарий:</label>
  <textarea id="comment-text"></textarea><br><br>
  <button id="submit-comment">Отправить</button>
  <button id="close-comment">Отмена</button>
</div>`;
document.body.insertAdjacentHTML("beforeend", modalHtml);

document.getElementById("close-comment").onclick = () => {
  document.getElementById("comment-modal").style.display = "none";
};



// Загружаем данные при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  loadUserOrders();
  displayUserInfo();
});
