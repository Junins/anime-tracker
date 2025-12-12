import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Perfil = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ nome: user?.nome || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          {!editMode ? (
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nome</label>
                  <div className="mt-1 text-lg">{user?.nome}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <div className="mt-1 text-lg">{user?.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Tipo de Usuário</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user?.tipo_usuario === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.tipo_usuario === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Membro desde</label>
                  <div className="mt-1">
                    {new Date(user?.data_criacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={() => {
                    setFormData({ nome: user.nome, email: user.email });
                    setEditMode(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Editar Perfil
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nome</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Perfil;