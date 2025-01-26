import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
    return (
        <>
            <Navbar />
            <div style={{ padding: "20px" }}>
                <Outlet /> {/* Sayfa içeriği burada gösterilecek */}
            </div>
        </>
    );
};

export default Layout;
