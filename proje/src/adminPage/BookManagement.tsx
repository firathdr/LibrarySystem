import React, { useEffect, useState } from "react";
import axios from "axios";

const BookManagement: React.FC = () => {
    const [books, setBooks] = useState<any[]>([]);
    const [newBook, setNewBook] = useState({
        name: "",
        author: "",
        publication_date: "",
        stock: 0,
    });
    const [editBook, setEditBook] = useState<any | null>(null); // Düzenlenecek kitap bilgileri

    const fetchBooks = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/books", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setBooks(response.data);
        } catch (error) {
            console.error("Failed to fetch books:", error);
        }
    };

    const handleDeleteBook = async (bookId: number) => {
        try {
            await axios.delete(`http://localhost:5000/api/books/${bookId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("Book deleted successfully!");
            fetchBooks();
        } catch (error) {
            console.error("Failed to delete book:", error);
        }
    };

    const handleAddBook = async () => {
        try {
            await axios.post(
                "http://localhost:5000/api/books",
                newBook,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert("Book added successfully!");
            setNewBook({
                name: "",
                author: "",
                publication_date: "",
                stock: 0,
            });
            fetchBooks();
        } catch (error) {
            console.error("Failed to add book:", error);
        }
    };

    const handleEditBook = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/books/${editBook.id}`,
                editBook,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert("Book updated successfully!");
            setEditBook(null); // Modal'ı kapat
            fetchBooks();
        } catch (error) {
            console.error("Failed to update book:", error);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return (

        <div className="container mt-4">
            <h2 className="mt-5">Add New Book</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddBook();
                }}
                className="mt-3"
            >
                <div className="d-flex flex-wrap justify-content-between">
                    <div className="form-group" style={{flex: "1 1 calc(25% - 10px)", margin: "5px"}}>
                        <label htmlFor="bookName">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="bookName"
                            placeholder="Book Name"
                            value={newBook.name}
                            onChange={(e) => setNewBook({...newBook, name: e.target.value})}
                        />
                    </div>
                    <div className="form-group" style={{flex: "1 1 calc(25% - 10px)", margin: "5px"}}>
                        <label htmlFor="bookAuthor">Author</label>
                        <input
                            type="text"
                            className="form-control"
                            id="bookAuthor"
                            placeholder="Author"
                            value={newBook.author}
                            onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                        />
                    </div>
                    <div className="form-group" style={{flex: "1 1 calc(25% - 10px)", margin: "5px"}}>
                        <label htmlFor="publicationDate">Publication Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="publicationDate"
                            value={newBook.publication_date}
                            onChange={(e) =>
                                setNewBook({...newBook, publication_date: e.target.value})
                            }
                        />
                    </div>
                    <div className="form-group" style={{flex: "1 1 calc(25% - 10px)", margin: "5px"}}>
                        <label htmlFor="stock">Stock</label>
                        <input
                            type="number"
                            className="form-control"
                            id="stock"
                            placeholder="Stock"
                            value={newBook.stock}
                            onChange={(e) =>
                                setNewBook({...newBook, stock: Number(e.target.value)})
                            }
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                    Add Book
                </button>
            </form>


            <h2 className="text-center mb-4">Book Management</h2>
            <table className="table table-bordered table-hover">
                <thead className="thead-dark">
                <tr>
                    <th>Name</th>
                    <th>Author</th>
                    <th>Publication Date</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {books.map((book) => (
                    <tr key={book.id}>
                        <td>{book.name}</td>
                        <td>{book.author}</td>
                        <td>{book.publication_date}</td>
                        <td>{book.stock}</td>
                        <td>
                            <button
                                className="btn btn-danger btn-sm mr-2"
                                onClick={() => handleDeleteBook(book.id)}
                            >
                                Delete
                            </button>
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={() => setEditBook(book)}
                            >
                                Edit
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>


            {/* Edit Modal */}
            {editBook && (
                <div className="modal show d-block" tabIndex={-1}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Book</h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setEditBook(null)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editBook.name}
                                        onChange={(e) =>
                                            setEditBook({...editBook, name: e.target.value})
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editBook.author}
                                        onChange={(e) =>
                                            setEditBook({...editBook, author: e.target.value})
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publication Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={editBook.publication_date}
                                        onChange={(e) =>
                                            setEditBook({
                                                ...editBook,
                                                publication_date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={editBook.stock}
                                        onChange={(e) =>
                                            setEditBook({
                                                ...editBook,
                                                stock: Number(e.target.value),
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditBook(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleEditBook}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagement;
