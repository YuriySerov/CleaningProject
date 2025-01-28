// Получаем ссылку на форму и добавляем обработчик события submit
document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();  // Предотвращаем стандартное поведение формы

    // Получаем значения из полей формы
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;  // Получаем email

    // Формируем данные для отправки
    const requestData = {
        username: username,
        password: password,
        email: email,  // Добавляем email в объект
    };

    try {
        // Отправляем данные на сервер через POST-запрос
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // Указываем, что отправляем данные в формате JSON
            },
            body: JSON.stringify(requestData),  // Преобразуем объект в строку JSON
        });

        // Проверяем статус ответа
        if (response.ok) {
            const result = await response.json();
            // Если регистрация прошла успешно, перенаправляем пользователя на страницу входа или главную
            alert("Регистрация прошла успешно. Пожалуйста, войдите.");
            window.location.href = "/login";  // Перенаправляем на страницу входа
        } else {
            // Если ошибка, показываем сообщение
            const errorData = await response.json();
            alert(errorData.detail || "Что-то пошло не так. Пожалуйста, попробуйте снова.");
        }
    } catch (error) {
        // Обработка ошибок запроса
        console.error("Ошибка при регистрации:", error);
        alert("Произошла ошибка при регистрации. Попробуйте снова.");
    }
});
