import React, { useEffect, useState } from "react";
import axios from "axios";

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState<string>("");

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/categories", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory) {
            alert("Category name cannot be empty!");
            return;
        }
        try {
            await axios.post(
                "http://localhost:5000/api/categories",
                { category_name: newCategory },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            alert("Category added successfully!");
            setNewCategory("");
            fetchCategories();
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("Category deleted successfully!");
            fetchCategories();
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Category Management</h2>

            {/* Kategori Tablosu */}
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((category) => (
                    <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.category_name}</td>
                        <td>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteCategory(category.id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Yeni Kategori Ekleme */}
            <h3 className="mt-5">Add New Category</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCategory();
                }}
                className="mt-3"
            >
                <div className="form-group">
                    <label htmlFor="categoryName">Category Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="categoryName"
                        placeholder="Enter category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Add Category
                </button>
            </form>
        </div>
    );
};

export default CategoryManagement;
