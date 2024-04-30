import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import NavBar from '../components/NavBar/insex';

const PublicRoutes = () => {
    return (
        <Router>
            {/* <NavBar /> */}
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
            </Routes>
        </Router>
    )
}

export default PublicRoutes