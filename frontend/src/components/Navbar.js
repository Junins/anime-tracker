import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">AnimeTracker</Link>
            <Link to="/obras" className="hover:bg-purple-700 px-3 py-2 rounded">Obras</Link>
            <Link to="/minha-lista" className="hover:bg-purple-700 px-3 py-2 rounded">Minha Lista</Link>
            {isAdmin() && (
              <Link to="/admin/obras" className="hover:bg-purple-700 px-3 py-2 rounded">Admin</Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/perfil" className="hover:bg-purple-700 px-3 py-2 rounded">
              {user?.nome}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;