import React, { useState, useEffect } from "react";
import axios from "axios";

interface BorrowedBook {
    book_id: number;
    book_name: string;
    author: string;
    borrow_date: string;
    return_date: string | null;
}

const BorrowedBooks: React.FC = () => {
    const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBorrowedBooks = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/borrowed-books", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setBorrowedBooks(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to fetch borrowed books.");
            }
        };

        fetchBorrowedBooks();
    }, []);

    const handleExtend = async (bookId: number) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/borrow/extend/${bookId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert(response.data.message);
            setBorrowedBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.book_id === bookId
                        ? { ...book, return_date: response.data.new_return_date }
                        : book
                )
            );
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to extend return date.");
        }
    };

    const handleReturn = async (bookId: number) => {
        try {
            const response = await axios.delete(
                `http://localhost:5000/api/borrow/return/${bookId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert(response.data.message);

            // Listeden ilgili kitabı kaldır
            setBorrowedBooks((prevBooks) =>
                prevBooks.filter((book) => book.book_id !== bookId)
            );
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to return the book.");
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Borrowed Books</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {borrowedBooks.length === 0 ? (
                <div className="alert alert-info text-center">No borrowed books found.</div>
            ) : (
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>Book Name</th>
                        <th>Author</th>
                        <th>Borrow Date</th>
                        <th>Return Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {borrowedBooks.map((book) => (
                        <tr key={book.book_id}>
                            <td>{book.book_name}</td>
                            <td>{book.author}</td>
                            <td>{book.borrow_date}</td>
                            <td>{book.return_date || "Not returned yet"}</td>
                            <td>
                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => handleExtend(book.book_id)}
                                >
                                    Extend
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleReturn(book.book_id)}
                                >
                                    Return
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BorrowedBooks;
