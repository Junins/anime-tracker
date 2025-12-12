import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { toast } from 'react-toastify';

const MinhaLista = () => {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', episodios_assistidos: '', nota: '', review: '' });

  useEffect(() => {
    fetchLista();
  }, []);

  const fetchLista = async () => {
    try {
      const response = await api.get('/minha-lista');
      setLista(response.data.listas);
    } catch (error) {
      toast.error('Erro ao carregar lista');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover esta obra da sua lista?')) return;
    
    try {
      await api.delete(`/minha-lista/${id}`);
      setLista(lista.filter(item => item.id !== id));
      toast.success('Removido da lista');
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({
      status: item.status,
      episodios_assistidos: item.episodios_assistidos || '',
      nota: item.nota || '',
      review: item.review || ''
    });
  };

  const handleEdit = async (id) => {
    try {
      const data = {
        status: editForm.status,
        episodios_assistidos: editForm.episodios_assistidos ? parseInt(editForm.episodios_assistidos) : undefined,
        nota: editForm.nota ? parseInt(editForm.nota) : undefined,
        review: editForm.review
      };
      
      const response = await api.put(`/minha-lista/${id}`, data);
      
      setLista(lista.map(item => 
        item.id === id ? { ...item, ...response.data.item } : item
      ));
      
      setEditingItem(null);
      toast.success('Atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'assistindo': 'bg-yellow-100 text-yellow-800',
      'completo': 'bg-green-100 text-green-800',
      'planejado': 'bg-blue-100 text-blue-800',
      'pausado': 'bg-gray-100 text-gray-800',
      'desisti': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando sua lista...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Minha Lista</h1>
        
        {lista.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 mb-4">Sua lista está vazia</div>
            <a href="/obras" className="text-purple-600 hover:text-purple-800">
              Explorar obras para adicionar →
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progresso
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
                  {lista.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{item.titulo}</div>
                          <div className="text-sm text-gray-500">
                            {item.tipo === 'anime' ? 'Anime' : 'Mangá'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {editingItem === item.id ? (
                          <select
                            className="border border-gray-300 rounded px-2 py-1"
                            value={editForm.status}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                          >
                            <option value="assistindo">Assistindo/Lendo</option>
                            <option value="completo">Completo</option>
                            <option value="planejado">Planejado</option>
                            <option value="pausado">Pausado</option>
                            <option value="desisti">Desisti</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)}`}>
                            {item.status === 'assistindo' ? 'Assistindo/Lendo' :
                             item.status === 'completo' ? 'Completo' :
                             item.status === 'planejado' ? 'Planejado' :
                             item.status === 'pausado' ? 'Pausado' : 'Desisti'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            className="border border-gray-300 rounded px-2 py-1 w-20"
                            value={editForm.episodios_assistidos}
                            onChange={(e) => setEditForm({...editForm, episodios_assistidos: e.target.value})}
                            min="0"
                            max={item.episodios_capitulos}
                          />
                        ) : (
                          <div>
                            {item.episodios_assistidos || 0} / {item.episodios_capitulos || '?'}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {editingItem === item.id ? (
                          <select
                            className="border border-gray-300 rounded px-2 py-1"
                            value={editForm.nota}
                            onChange={(e) => setEditForm({...editForm, nota: e.target.value})}
                          >
                            <option value="">Sem nota</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            {item.nota ? `⭐ ${item.nota}/10` : 'Sem nota'}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {editingItem === item.id ? (
                            <>
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(item)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remover
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MinhaLista;