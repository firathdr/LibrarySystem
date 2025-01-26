from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mysql.connector
from flask_cors import CORS
import bcrypt  # bcrypt kütüphanesi
from datetime import datetime, timedelta
from flask_jwt_extended import get_jwt
app = Flask(__name__)
CORS(app)  # Tüm rotalar için CORS'u etkinleştir

# JWT Ayarları
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key'
jwt = JWTManager(app)

# Veritabanı bağlantısı
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="YOURPASSWORD",
        database="library"
    )

# Kullanıcı Kayıt
@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    # Şifreyi bcrypt ile hashle
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                   (name, email, hashed_password.decode('utf-8'), 'user'))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({'message': 'User registered successfully'}), 201

# Kullanıcı Giriş
@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Veritabanı bağlantısı
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Kullanıcıyı bul
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401

    # Şifre doğrulaması (bcrypt ile karşılaştır)
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid email or password'}), 401

    # JWT Token oluştur

    access_token = create_access_token(
        identity=str(user['id']),  # Identity string formatında
        additional_claims={
            'email': user['email'],  # Ek bilgiler
            'role': user['role']
        }
    )
    return jsonify({'access_token': access_token}), 200

# Korunan Rota

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    claims = get_jwt()  # JWT'nin tüm alanlarına erişim
    user_id = claims['sub']['id']  # Dictionary olarak sub alanını al
    email = claims['sub']['email']
    role = claims['sub']['role']

    return jsonify({
        'user_id': user_id,
        'email': email,
        'role': role
    }), 200


# Kitapları Listeleme
@app.route('/api/books', methods=['GET'])
def get_books():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM books")
    books = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(books), 200


@app.route('/api/borrow', methods=['POST'])
@jwt_required()
def borrow_book():
    try:
        # JWT'den kullanıcı kimliğini al
        claims = get_jwt()
        user_id = claims['sub']  # Kullanıcının kimliğini JWT'den al
        print("User ID:", user_id)

        # Gelen JSON verilerini al
        data = request.json
        print("Received JSON:", data)

        # JSON'da eksik alanları kontrol et
        book_id = data.get('book_id')
        return_date = data.get('return_date')

        if not book_id or not return_date:
            return jsonify({'message': 'Missing book_id or return_date.'}), 400

        # Tarih formatını kontrol et ve bugünün tarihinden önce olmadığını doğrula
        try:
            return_date_obj = datetime.strptime(return_date, '%Y-%m-%d')
            today_date_obj = datetime.today()

            if return_date_obj < today_date_obj:
                return jsonify({'message': 'Return date cannot be earlier than today.'}), 400
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        borrow_date = today_date_obj.strftime('%Y-%m-%d')

        # Veritabanı bağlantısı
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Kullanıcının aynı kitabı daha önce ödünç alıp almadığını kontrol et
        cursor.execute("SELECT * FROM borrow WHERE user_id = %s AND book_id = %s AND return_date IS NULL", (user_id, book_id))
        borrowed = cursor.fetchone()

        if borrowed:
            return jsonify({'message': 'You already borrowed this book'}), 400

        # Ödünç alma işlemi
        cursor.execute(
            "INSERT INTO borrow (user_id, book_id, borrow_date, return_date) VALUES (%s, %s, %s, %s)",
            (user_id, book_id, borrow_date, return_date)
        )
        cursor.execute(
            "UPDATE books SET stock = stock - 1 WHERE id = %s",
            (book_id,)
        )
        connection.commit()

        return jsonify({'message': 'Book borrowed successfully'}), 201

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'message': 'Internal Server Error'}), 500

    finally:
        # `cursor` ve `connection` tanımlıysa kapat
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()

@app.route('/api/borrowed-books', methods=['GET'])
@jwt_required()
def get_borrowed_books():
    try:
        # JWT'den kullanıcı kimliği alın
        user_id = get_jwt_identity()  # Sadece string ID dönecek
        print("User ID:", user_id)  # Debug için logla

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Kullanıcının ödünç aldığı kitapları sorgula
        query = """
            SELECT b.id AS book_id, b.name AS book_name, b.author, br.borrow_date, br.return_date
            FROM borrow br
            JOIN books b ON br.book_id = b.id
            WHERE br.user_id = %s
        """
        cursor.execute(query, (user_id,))
        borrowed_books = cursor.fetchall()

        cursor.close()
        connection.close()

        # Sonuçları döndür
        return jsonify(borrowed_books), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'message': 'Internal Server Error'}), 500



@app.route('/api/borrow/extend/<int:book_id>', methods=['PUT'])
@jwt_required()
def extend_borrow_date(book_id):
    try:
        user_id = get_jwt_identity()
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Mevcut ödünç bilgilerini kontrol et
        cursor.execute(
            "SELECT return_date FROM borrow WHERE user_id = %s AND book_id = %s AND return_date IS NOT NULL",
            (user_id, book_id)
        )
        borrow = cursor.fetchone()

        if not borrow:
            return jsonify({'message': 'No active borrow found for this book'}), 400

        # Eğer return_date datetime.date ise, doğrudan işlem yap
        current_return_date = borrow['return_date']  # Bu bir datetime.date nesnesi olmalı
        if isinstance(current_return_date, str):
            current_return_date = datetime.strptime(current_return_date, '%Y-%m-%d')

        # Yeni teslim tarihi hesapla
        new_return_date = current_return_date + timedelta(days=7)

        # Teslim tarihini güncelle
        cursor.execute(
            "UPDATE borrow SET return_date = %s WHERE user_id = %s AND book_id = %s",
            (new_return_date.strftime('%Y-%m-%d'), user_id, book_id)
        )
        connection.commit()

        return jsonify({'message': 'Return date extended successfully', 'new_return_date': new_return_date.strftime('%Y-%m-%d')}), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'message': 'Failed to extend return date'}), 500
    finally:
        cursor.close()
        connection.close()
@app.route('/api/borrow/return/<int:book_id>', methods=['DELETE'])
@jwt_required()
def return_borrow(book_id):
    try:
        user_id = get_jwt_identity()
        print("User ID from JWT:", user_id)  # Debug için loglama
        print("Book ID received:", book_id)  # Debug için loglama

        connection = get_db_connection()
        cursor = connection.cursor()

        # Borrow tablosundan kaydı sil
        cursor.execute(
            "DELETE FROM borrow WHERE user_id = %s AND book_id = %s",
            (user_id, book_id)
        )
        print(f"Deleted borrow record for user_id={user_id}, book_id={book_id}")

        # Kitap stokunu artır
        cursor.execute(
            "UPDATE books SET stock = stock + 1 WHERE id = %s",
            (book_id,)
        )
        print(f"Updated stock for book_id={book_id}")

        # Veritabanı işlemini kaydet
        connection.commit()
        print("Database changes committed.")

        return jsonify({'message': 'Book returned successfully'}), 200
    except Exception as e:
        print("Error:", str(e))  # Hataları logla
        return jsonify({'message': 'Failed to return the book'}), 500
    finally:
        cursor.close()
        connection.close()
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims['role'] != 'admin':  # Sadece admin izinli
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT id, name, email, role FROM users")
    users = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(users), 200

@app.route('/api/books', methods=['POST'])
@jwt_required()
def add_book():
    claims = get_jwt()
    if claims['role'] != 'admin':  # Sadece admin izinli
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    name = data.get('name')
    author = data.get('author')
    publication_date = data.get('publication_date')
    stock = data.get('stock')

    if not name or not author or not publication_date or stock is None:
        return jsonify({'message': 'All fields are required'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "INSERT INTO books (name, author, publication_date, stock) VALUES (%s, %s, %s, %s)",
        (name, author, publication_date, stock)
    )
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Book added successfully'}), 201
@app.route('/api/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    claims = get_jwt()
    if claims['role'] != 'admin':  # Sadece admin izinli
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM books_category WHERE book_id = %s", (book_id,))
    cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Book deleted successfully'}), 200
@app.route('/api/books/<int:book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    claims = get_jwt()
    if claims['role'] != 'admin':  # Sadece admin izinli
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    name = data.get('name')
    author = data.get('author')
    publication_date = data.get('publication_date')
    stock = data.get('stock')

    if not name or not author or not publication_date or stock is None:
        return jsonify({'message': 'All fields are required'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "UPDATE books SET name = %s, author = %s, publication_date = %s, stock = %s WHERE id = %s",
        (name, author, publication_date, stock, book_id)
    )
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Book updated successfully'}), 200
@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT id, name, email, role FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(user), 200

@app.route('/api/users/<int:user_id>/borrowed-books', methods=['GET'])
@jwt_required()
def get_user_borrowed_books(user_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
        SELECT b.id AS book_id, b.name AS book_name, b.author, br.borrow_date, br.return_date
        FROM borrow br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = %s
    """
    cursor.execute(query, (user_id,))
    borrowed_books = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(borrowed_books), 200
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'User deleted successfully'}), 200
@app.route('/api/users/<int:user_id>/grant-admin', methods=['PUT'])
@jwt_required()
def grant_admin(user_id):
    claims = get_jwt()
    if claims['role'] != 'admin':  # Sadece admin izinli
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("UPDATE users SET role = 'admin' WHERE id = %s", (user_id,))
        connection.commit()

        return jsonify({'message': 'User granted admin role successfully'}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'message': 'Internal Server Error'}), 500

    finally:
        cursor.close()
        connection.close()
@app.route('/api/borrow/return', methods=['PUT'])
@jwt_required()
def return_book():
    connection = None
    cursor = None
    try:
        # Gelen JSON'u al ve logla
        data = request.json
        print("Received JSON:", data)

        user_id = data.get('user_id')
        book_id = data.get('book_id')

        if not user_id or not book_id:
            return jsonify({"message": "Missing user_id or book_id"}), 400

        # Veritabanı bağlantısı oluştur
        connection = get_db_connection()
        cursor = connection.cursor()

        # Borrow tablosundan kaydı sil
        delete_query = "DELETE FROM borrow WHERE user_id = %s AND book_id = %s"
        cursor.execute(delete_query, (user_id, book_id))
        connection.commit()

        # Kitap stoğunu artır
        update_query = "UPDATE books SET stock = stock + 1 WHERE id = %s"
        cursor.execute(update_query, (book_id,))
        connection.commit()

        return jsonify({"message": "Book returned successfully"}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"message": "Internal Server Error"}), 500

    finally:
        # cursor ve connection tanımlıysa kapat
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/api/categories', methods=['POST'])
@jwt_required()
def add_category():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    category_name = data.get('category_name')

    if not category_name:
        return jsonify({'message': 'Category name is required'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("INSERT INTO categories (category_name) VALUES (%s)", (category_name,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Category added successfully'}), 201
@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'message': 'Category deleted successfully'}), 200
@app.route('/api/categories', methods=['GET'])
@jwt_required()
def get_categories():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT id, category_name FROM categories")
    categories = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(categories), 200
@app.route('/api/books/<int:category_id>', methods=['GET'])
@jwt_required()
def get_books_by_category(category_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT b.id, b.name, b.author, b.publication_date, b.stock
    FROM books b
    INNER JOIN books_category bc ON b.id = bc.book_id
    WHERE bc.category_id = %s
    """
    cursor.execute(query, (category_id,))
    books = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(books), 200
@app.route('/api/books/add-to-category', methods=['POST'])
@jwt_required()
def add_book_to_category():
    try:
        data = request.json
        book_id = data.get('book_id')
        category_id = data.get('category_id')

        if not book_id or not category_id:
            return jsonify({"message": "Missing book_id or category_id"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # Kitabı kategoriye ekle
        query = "INSERT INTO books_category (book_id, category_id) VALUES (%s, %s)"
        cursor.execute(query, (book_id, category_id))
        connection.commit()

        return jsonify({"message": "Book added to category successfully"}), 201

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"message": "Internal Server Error"}), 500

    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True)
