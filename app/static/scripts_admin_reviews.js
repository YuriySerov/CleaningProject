// Получаем таблицу для отзывов и форму
const reviewsTable = document.getElementById('reviews-table').getElementsByTagName('tbody')[0];
const reviewForm = document.getElementById('form-reviews');
const formTitleReview = document.getElementById('form-title-reviews');

// Функция для отображения модального окна
function showReviewModal(modalId, review = null) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";

    // Закрытие модального окна при клике на крестик
    modal.querySelector(".close").onclick = () => closeModal(modalId);

    // Закрытие при клике вне модального окна
    window.onclick = (event) => {
        if (event.target === modal) closeModal(modalId);
    };

    if (review) {
        // Заполняем форму данными для редактирования
        formTitleReview.innerText = 'Редактировать отзыв';
        document.getElementById('rating').value = review.rating;
        document.getElementById('comment').value = review.comment;
        reviewForm.onsubmit = (event) => editReview(event, review.review_id);  // Привязываем обработчик для редактирования
    } else {
        // Подготовка формы для добавления нового отзыва
        formTitleReview.innerText = 'Добавить отзыв';
        document.getElementById('rating').value = '';
        document.getElementById('comment').value = '';
        reviewForm.onsubmit = (event) => addReview(event);  // Привязываем обработчик для добавления
    }
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

// Функция для загрузки отзывов с привязкой к услугам
async function loadReviews() {
    const response = await fetch('/api/reviews');
    const reviews = await response.json();
    reviewsTable.innerHTML = ''; // Очищаем таблицу

    reviews.forEach(review => {
        const row = reviewsTable.insertRow();

        row.insertCell(0).innerText = review.service_name;  // Название услуги
        row.insertCell(1).innerText = review.rating;        // Рейтинг
        row.insertCell(2).innerText = review.review_date;   // Дата отзыва
        row.insertCell(3).innerText = review.comment;       // Комментарий

        // Кнопка для редактирования
        const actionsCell = row.insertCell(4);
        const editButton = document.createElement('button');
        editButton.innerText = 'Редактировать';
        editButton.classList.add('button', 'button-edit');
        editButton.onclick = () => showReviewModal('review-modal', review);
        actionsCell.appendChild(editButton);

        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Удалить';
        deleteButton.classList.add('button', 'button-delete');
        deleteButton.onclick = () => deleteReview(review.review_id);
        actionsCell.appendChild(deleteButton);
    });
}

// Функция для фильтрации отзывов
function filterReviews() {
    const searchQuery = document.getElementById('search-input-reviews').value.toLowerCase();
    const rows = document.getElementById('reviews-table').getElementsByTagName('tr');

    Array.from(rows).forEach((row, index) => {
        // Пропускаем первую строку (шапку таблицы)
        if (index === 0) return;

        const rating = row.cells[1].innerText.toLowerCase();
        const comment = row.cells[3].innerText.toLowerCase();

        if (rating.includes(searchQuery) || comment.includes(searchQuery)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}


// Обработчик отправки формы для добавления нового отзыва
async function addReview(event) {
    event.preventDefault();

    const newReview = {
        rating: parseInt(document.getElementById('rating').value),
        comment: document.getElementById('comment').value
    };

    try {
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReview),
        });

        if (response.ok) {
            loadReviews();  // Перезагружаем список отзывов
            closeModal('review-modal');
        } else {
            const errorData = await response.json();
            alert(`Ошибка: ${errorData.detail || 'Неизвестная ошибка'}`);
        }
    } catch (error) {
        alert('Ошибка при добавлении отзыва');
    }
}

// Функция для редактирования отзыва
async function editReview(event, reviewId) {
    event.preventDefault();

    const rating = parseInt(document.getElementById('rating').value);
    const comment = document.getElementById('comment').value;

    // Логируем данные перед отправкой
    console.log("Sending data to server:", { rating, comment });

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Рейтинг должен быть числом от 1 до 5.");
        return;
    }

    if (!comment || comment.length < 5) {
        alert("Комментарий должен содержать хотя бы 5 символов.");
        return;
    }

    const updatedReview = { rating, comment };

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReview),
        });

        if (response.ok) {
            const updatedReviewData = await response.json();
            console.log("Updated review:", updatedReviewData);
            loadReviews();  // Перезагружаем список отзывов
            closeModal('review-modal');
        } else {
            const errorData = await response.json();
            console.log("Error response:", errorData);
            alert(`Ошибка: ${Array.isArray(errorData.detail) ? errorData.detail.join(', ') : errorData.detail}`);
        }
    } catch (error) {
        console.error("Request error:", error);
        alert('Ошибка при редактировании отзыва');
    }
}


// Функция для удаления отзыва
async function deleteReview(reviewId) {
    if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadReviews();  // Перезагружаем список отзывов после удаления
        } else {
            alert('Ошибка при удалении отзыва');
        }
    }
}

// Инициализация
loadReviews();
