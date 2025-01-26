import React, { useEffect, useState } from "react";
import axios from "axios";

const BookCategoryManagement: React.FC = () => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Kitapları ve kategorileri getirme
    useEffect(() => {
        const fetchBooksAndCategories = async () => {
            try {
                const booksResponse = await axios.get("http://localhost:5000/api/books", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setBooks(booksResponse.data);

                const categoriesResponse = await axios.get("http://localhost:5000/api/categories", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setCategories(categoriesResponse.data);
            } catch (err) {
                setError("Failed to fetch data. Please try again.");
            }
        };

        fetchBooksAndCategories();
    }, []);

    // Kitabı kategoriye ekleme
    const handleAddBookToCategory = async () => {
        if (!selectedBook || !selectedCategory) {
            setError("Please select both a book and a category.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/books/add-to-category",
                {
                    book_id: selectedBook,
                    category_id: selectedCategory,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );

            setSuccess(response.data.message);
            setError("");
        } catch (err) {
            setError("Failed to add book to category. Please try again.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Book Category Management</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
                <label htmlFor="bookSelect">Select Book</label>
                <select
                    id="bookSelect"
                    className="form-control"
                    value={selectedBook || ""}
                    onChange={(e) => setSelectedBook(e.target.value)}
                >
                    <option value="">-- Select a Book --</option>
                    {books.map((book: any) => (
                        <option key={book.id} value={book.id}>
                            {book.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group mt-3">
                <label htmlFor="categorySelect">Select Category</label>
                <select
                    id="categorySelect"
                    className="form-control"
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">-- Select a Category --</option>
                    {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className="btn btn-primary mt-3"
                onClick={handleAddBookToCategory}
            >
                Add Book to Category
            </button>
        </div>
    );
};

export default BookCategoryManagement;
