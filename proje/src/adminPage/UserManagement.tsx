import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/users", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    const handleUserClick = (userId: number) => {
        navigate(`/admin/users/${userId}`); // Kullanıcı detaylarına yönlendir
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">User Management</h2>
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUserClick(user.id)}
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
