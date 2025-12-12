import React from 'react';

const ObraModal = ({ obra, isOpen, onClose, onAddToList }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{obra.titulo}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm ${
              obra.tipo === 'anime' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {obra.tipo === 'anime' ? 'Anime' : 'Mangá'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              obra.status === 'lançando' ? 'bg-yellow-100 text-yellow-800' :
              obra.status === 'completo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {obra.status}
            </span>
            {obra.nota_media > 0 && (
              <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-bold">
                Nota: {obra.nota_media.toFixed(1)}
              </span>
            )}
          </div>
          
          {obra.descricao && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{obra.descricao}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {obra.episodios_capitulos && (
              <div>
                <h4 className="font-medium text-gray-600">
                  {obra.tipo === 'anime' ? 'Episódios' : 'Capítulos'}
                </h4>
                <p>{obra.episodios_capitulos}</p>
              </div>
            )}
            
            {obra.data_lancamento && (
              <div>
                <h4 className="font-medium text-gray-600">Data de Lançamento</h4>
                <p>{new Date(obra.data_lancamento).toLocaleDateString()}</p>
              </div>
            )}
            
            {obra.criador_nome && (
              <div>
                <h4 className="font-medium text-gray-600">Adicionado por</h4>
                <p>{obra.criador_nome}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onAddToList(obra.id);
                onClose();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Adicionar à Minha Lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObraModal;