import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UserDetails: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<any | null>(null);
    const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        }
    };

    const fetchBorrowedBooks = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/${userId}/borrowed-books`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setBorrowedBooks(response.data);
        } catch (error) {
            console.error("Failed to fetch borrowed books:", error);
        }
    };

    const handleReturnBook = async (userId: string, bookId: number) => {
        try {
            await axios.put(
                "http://localhost:5000/api/borrow/return",
                {
                    user_id: userId,
                    book_id: bookId,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert("Book returned successfully!");
            fetchBorrowedBooks();
        } catch (error) {
            console.error("Failed to return book:", error);
            alert("Failed to return book.");
        }
    };

    const handleGrantAdmin = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/users/${userId}/grant-admin`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert("User is now an admin!");
            fetchUserDetails();
        } catch (error) {
            console.error("Failed to grant admin role:", error);
        }
    };

    const handleDeleteUser = async () => {
        const confirm = window.confirm("Are you sure you want to delete this user?");
        if (!confirm) return;

        try {
            await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("User deleted successfully!");
            navigate("/admin"); // Kullanıcı silindikten sonra admin sayfasına yönlendir
        } catch (error) {
            console.error("Failed to delete user:", error);
            alert("Failed to delete user.");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchUserDetails();
            await fetchBorrowedBooks();
            setLoading(false);
        };

        loadData();
    }, []);

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container mt-5">
            <h1 className="text-center">User Details</h1>
            {user && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h2 className="card-title">{user.name}</h2>
                        <p className="card-text"><strong>Email:</strong> {user.email}</p>
                        <p className="card-text"><strong>Role:</strong> {user.role}</p>
                        <button
                            className={`btn btn-${user.role === "admin" ? "secondary" : "primary"} btn-sm`}
                            onClick={handleGrantAdmin}
                            disabled={user.role === "admin"}
                        >
                            {user.role === "admin" ? "Already Admin" : "Grant Admin"}
                        </button>
                        <button
                            className="btn btn-danger btn-sm ml-2"
                            onClick={handleDeleteUser}
                        >
                            Delete User
                        </button>
                    </div>
                </div>
            )}

            <h2 className="mb-3">Borrowed Books</h2>
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                <tr>
                    <th>Name</th>
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
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReturnBook(userId!, book.book_id)}
                            >
                                Return
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
};

export default UserDetails;
