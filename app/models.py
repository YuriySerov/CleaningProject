from app.database import get_db_connection
from typing import Tuple, Optional


### Users
# Create - добавление нового пользователя
def create_user(
    username: str, password: str, email: Optional[str], role_id: int
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Users (Username, Password, Email, RoleID) VALUES (%s, %s, %s, %s) RETURNING UserID;",
        (username, password, email, role_id),
    )
    user_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return user_id


# Исправленный пример функции получения пользователя по имени пользователя
def get_user_by_username(
    username: str,
) -> Optional[Tuple[int, str, str, Optional[str], int]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users WHERE Username = %s;", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user
