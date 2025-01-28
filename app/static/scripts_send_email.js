// Получение элементов
const sendEmailButton = document.getElementById("send-email-button");
const emailModal = document.getElementById("email-modal");
const emailForm = document.getElementById("email-form");

// Открытие модального окна
sendEmailButton.addEventListener("click", () => {
    emailModal.style.display = "block";
});

// Закрытие модального окна
emailModal.querySelector(".close").addEventListener("click", () => {
    emailModal.style.display = "none";
});

// Закрытие модального окна при клике вне его
window.onclick = (event) => {
    if (event.target === emailModal) {
        emailModal.style.display = "none";
    }
};

// Обработка отправки формы
emailForm.onsubmit = async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const format = document.getElementById("format").value;

    try {
        const response = await fetch("/api/send-services", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, format }),
        });

        if (response.ok) {
            alert("Услуги успешно отправлены!");
            emailModal.style.display = "none";
        } else {
            const result = await response.json();
            alert(result.detail || "Ошибка при отправке услуг");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при отправке услуг");
    }
};
