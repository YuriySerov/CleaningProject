import bcrypt


# Хеширование пароля
def hash_password(password: str) -> str:
    # Генерация соли (salt)
    salt = bcrypt.gensalt()
    # Хеширование пароля с солью
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    # Возвращаем хешированный пароль в виде строки
    return hashed_password.decode("utf-8")


# Проверка пароля
def check_password(plain_password: str, hashed_password: str) -> bool:
    # Сравниваем введенный пароль с сохраненным хешом
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )
