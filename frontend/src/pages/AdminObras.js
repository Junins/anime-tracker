import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const AdminObras = () => {
  const { isAdmin } = useAuth();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'anime',
    status: 'lançando',
    episodios_capitulos: '',
    data_lancamento: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchObras();
    }
  }, [isAdmin]);

  const fetchObras = async () => {
    try {
      const response = await api.get('/obras');
      setObras(response.data.obras);
    } catch (error) {
      toast.error('Erro ao carregar obras');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        episodios_capitulos: formData.episodios_capitulos ? parseInt(formData.episodios_capitulos) : undefined
      };
      
      if (editingId) {
        await api.put(`/obras/${editingId}`, data);
        toast.success('Obra atualizada com sucesso!');
      } else {
        await api.post('/obras', data);
        toast.success('Obra criada com sucesso!');
      }
      
      fetchObras();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar obra');
    }
  };

  const handleEdit = (obra) => {
    setFormData({
      titulo: obra.titulo,
      descricao: obra.descricao || '',
      tipo: obra.tipo,
      status: obra.status,
      episodios_capitulos: obra.episodios_capitulos || '',
      data_lancamento: obra.data_lancamento || ''
    });
    setEditingId(obra.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta obra?')) return;
    
    try {
      await api.delete(`/obras/${id}`);
      toast.success('Obra excluída com sucesso!');
      fetchObras();
    } catch (error) {
      toast.error('Erro ao excluir obra');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'anime',
      status: 'lançando',
      episodios_capitulos: '',
      data_lancamento: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isAdmin()) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Acesso negado. Somente administradores podem acessar esta página.
          </div>
        </div>
      </>
    );
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Administração de Obras</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            {showForm ? 'Cancelar' : 'Nova Obra'}
          </button>
        </div>
        
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Obra' : 'Nova Obra'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  >
                    <option value="anime">Anime</option>
                    <option value="manga">Mangá</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status *</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="lançando">Lançando</option>
                    <option value="completo">Completo</option>
                    <option value="planejado">Planejado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {formData.tipo === 'anime' ? 'Episódios' : 'Capítulos'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.episodios_capitulos}
                    onChange={(e) => setFormData({...formData, episodios_capitulos: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Data de Lançamento</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.data_lancamento}
                    onChange={(e) => setFormData({...formData, data_lancamento: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {obras.map((obra) => (
                  <tr key={obra.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{obra.titulo}</div>
                      {obra.descricao && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {obra.descricao}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        obra.tipo === 'anime' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {obra.tipo === 'anime' ? 'Anime' : 'Mangá'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        obra.status === 'lançando' ? 'bg-yellow-100 text-yellow-800' :
                        obra.status === 'completo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {obra.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {obra.nota_media > 0 ? obra.nota_media.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(obra)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(obra.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminObras;