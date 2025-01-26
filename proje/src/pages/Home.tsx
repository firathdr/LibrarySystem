import React from "react";

const Home: React.FC = () => {
    return (
        <div className="container-fluid bg-light vh-100 d-flex flex-column justify-content-center align-items-center">
            <div className="text-center">
                <h1 className="display-3 fw-bold text-primary mb-4">
                    Discover Your Next Favorite Book
                </h1>
                <p className="lead text-secondary mb-5">
                    Welcome to the Library System! Dive into our vast collection of books, journals,
                    and multimedia resources. Enjoy seamless management of your library activities.
                </p>
                <div className="row mt-5 justify-content-center">
                    <div className="col-md-4 d-flex justify-content-center">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h5 className="card-title">Borrow & Return</h5>
                                <p className="card-text text-muted">
                                    Manage your borrowing and returning activities seamlessly.
                                </p>
                                <a href="/books" className="btn btn-primary">Get Started</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
