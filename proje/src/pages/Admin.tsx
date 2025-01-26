import React, { useState } from "react";
import BookManagement from "../adminPage/BookManagement";
import UserManagement from "../adminPage/UserManagement";
import CategoryManagement from "../adminPage/CategoryManagement";
import BookCategoryManagement from "../adminPage/BookCategoryManagement";

const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"books" | "users" | "categories" | "BooksCategory">(
        "books"
    );

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Admin Dashboard</h1>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "books" ? "active" : ""}`}
                        onClick={() => setActiveTab("books")}
                    >
                        Book Management
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        User Management
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "categories" ? "active" : ""}`}
                        onClick={() => setActiveTab("categories")}
                    >
                        Category Management
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "BooksCategory" ? "active" : ""}`}
                        onClick={() => setActiveTab("BooksCategory")}
                    >
                        Books Category Management
                    </button>
                </li>
            </ul>
            <div className="mt-4">
                {activeTab === "books" && <BookManagement />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "categories" && <CategoryManagement />}
                {activeTab === "BooksCategory" && <BookCategoryManagement />}
            </div>
        </div>
    );
};

export default Admin;
