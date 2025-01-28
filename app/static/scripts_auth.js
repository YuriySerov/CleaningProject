document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();  // предотвращаем стандартное отправление формы

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
        // Сохраняем токен и roleid в localStorage
        const token = result.access_token;
        const roleid = result.roleid;

        localStorage.setItem("username", username);
        localStorage.setItem("token", token);
        localStorage.setItem("roleid", roleid);


        // Выводим токен в консоль для отладки
        console.log("Токен:", token);
        // Перенаправляем в зависимости от роли пользователя
        if (roleid === 2) {
            window.location.href = "/admin";  // Перенаправление на страницу администратора
        } else {
            window.location.href = "/";  // Перенаправление на главную страницу
        }
    } else {
        alert(result.detail || "Ошибка при авторизации. Попробуйте снова.");
    }
});
