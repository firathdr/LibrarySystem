import React, { useState, useEffect } from "react";
import axios from "axios";

const Books: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [books, setBooks] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedBook, setSelectedBook] = useState<any | null>(null);
    const [returnDate, setReturnDate] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // Kategorileri Backend'den Al
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/categories", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            // Seçilen kategoriye göre kitapları getir
            const fetchBooks = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:5000/api/books/${selectedCategory}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }
                    );
                    setBooks(response.data);
                } catch (err) {
                    console.error("Failed to fetch books:", err);
                }
            };

            fetchBooks();
        }
    }, [selectedCategory]);

    const handleBorrow = async () => {
        if (!returnDate) {
            setError("Please select a return date.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/borrow",
                {
                    book_id: selectedBook.id,
                    return_date: returnDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setSuccess(response.data.message);
            alert("başarılı")
            setSelectedBook(null); // Modal'ı kapat
            setReturnDate(""); // Tarihi temizle
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to borrow the book.");
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Books</h1>

            {/* Kategori Seçimi */}
            <div className="mb-4">
                <label htmlFor="categorySelect" className="form-label">
                    Select Category
                </label>
                <select
                    id="categorySelect"
                    className="form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">-- Select a Category --</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Kitapları Göster */}
            {books.length === 0 ? (
                <p className="text-center">No books available for the selected category.</p>
            ) : (
                <div className="row">
                    {books.map((book) => (
                        <div key={book.id} className="col-md-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{book.name}</h5>
                                    <p className="card-text">Author: {book.author}</p>
                                    <p className="card-text">Stock: {book.stock}</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSelectedBook(book)}
                                        disabled={book.stock === 0}
                                    >
                                        Borrow
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Borrow Modal */}
            {selectedBook && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Borrow "{selectedBook.name}"</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedBook(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Borrow Date:{" "}
                                    <strong>{new Date().toLocaleDateString()}</strong>
                                </p>
                                <div className="mb-3">
                                    <label htmlFor="returnDate" className="form-label">
                                        Return Date
                                    </label>
                                    <input
                                        type="date"
                                        id="returnDate"
                                        className="form-control"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedBook(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleBorrow}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
