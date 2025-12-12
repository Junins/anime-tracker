import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { toast } from 'react-toastify';
import ObraModal from '../components/ObraModal';

const Obras = () => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ tipo: '', status: '', search: '' });
  const [selectedObra, setSelectedObra] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchObras();
  }, [filters]);

  const fetchObras = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/obras?${params}`);
      setObras(response.data.obras);
    } catch (error) {
      toast.error('Erro ao carregar obras');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (obraId) => {
    try {
      await api.post('/minha-lista', { obra_id: obraId, status: 'planejado' });
      toast.success('Adicionado à sua lista!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar à lista');
    }
  };

  const openObraModal = (obra) => {
    setSelectedObra(obra);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando obras...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Obras</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={filters.tipo}
                onChange={(e) => setFilters({...filters, tipo: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="anime">Anime</option>
                <option value="manga">Mangá</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="lançando">Lançando</option>
                <option value="completo">Completo</option>
                <option value="planejado">Planejado</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Pesquisar por título..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <div key={obra.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{obra.titulo}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded ${
                        obra.tipo === 'anime' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {obra.tipo === 'anime' ? 'Anime' : 'Mangá'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        obra.status === 'lançando' ? 'bg-yellow-100 text-yellow-800' :
                        obra.status === 'completo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {obra.status}
                      </span>
                    </div>
                  </div>
                  {obra.nota_media > 0 && (
                    <div className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded">
                      {obra.nota_media.toFixed(1)}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {obra.descricao || 'Sem descrição'}
                </p>
                
                <div className="text-sm text-gray-500 mb-4">
                  {obra.episodios_capitulos && (
                    <div>
                      {obra.tipo === 'anime' ? 'Episódios:' : 'Capítulos:'} {obra.episodios_capitulos}
                    </div>
                  )}
                  {obra.data_lancamento && (
                    <div>Lançamento: {new Date(obra.data_lancamento).toLocaleDateString()}</div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openObraModal(obra)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleAddToList(obra.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {obras.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">Nenhuma obra encontrada</div>
          </div>
        )}
      </div>
      
      {selectedObra && (
        <ObraModal
          obra={selectedObra}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddToList={handleAddToList}
        />
      )}
    </>
  );
};

export default Obras;