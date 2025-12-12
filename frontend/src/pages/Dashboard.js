import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [recentObras, setRecentObras] = useState([]);
  const [stats, setStats] = useState({ totalObras: 0, minhaLista: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [obrasRes, listaRes] = await Promise.all([
        api.get('/obras?limit=5'),
        api.get('/minha-lista')
      ]);
      
      setRecentObras(obrasRes.data.obras.slice(0, 5));
      setStats({
        totalObras: obrasRes.data.obras.length,
        minhaLista: listaRes.data.listas.length
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de Obras:</span>
                <span className="font-bold">{stats.totalObras}</span>
              </div>
              <div className="flex justify-between">
                <span>Na Minha Lista:</span>
                <span className="font-bold">{stats.minhaLista}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link to="/obras" className="block w-full text-center bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                Explorar Obras
              </Link>
              <Link to="/minha-lista" className="block w-full text-center bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                Ver Minha Lista
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Obras Recentes</h2>
          </div>
          <div className="divide-y">
            {recentObras.map((obra) => (
              <div key={obra.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{obra.titulo}</h3>
                    <p className="text-sm text-gray-600">
                      {obra.tipo === 'anime' ? 'Anime' : 'Mangá'} • {obra.status}
                    </p>
                  </div>
                  <Link 
                    to={`/obras`}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;