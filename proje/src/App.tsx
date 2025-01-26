import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BorrowedBooks from "./pages/BorrowedBooks";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Register bileşenini ekle
import Navbar from "./components/Navbar";
import Admin from "./pages/Admin.tsx";
import UserDetails from "./adminPage/UserDetails";


const App: React.FC = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/borrowed-books" element={<BorrowedBooks />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users/:userId" element={<UserDetails />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> {/* Register rotası */}
            </Routes>
        </Router>
    );
};

export default App;
