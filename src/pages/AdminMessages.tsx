import React, { useEffect, useState } from 'react';
import { Inbox, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { messageService } from '../services/messageService';

interface Message {
  _id: string;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'all', label: 'Todos', icon: Inbox },
    { id: 'unread', label: 'No leídos', icon: XCircle },
    { id: 'read', label: 'Leídos', icon: CheckCircle },
  ];

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/messages');
      // Messages are already sorted by date on the backend
      setMessages(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await messageService.markAsRead(id);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, leido: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.mensaje.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case 'unread':
        return !message.leido && matchesSearch;
      case 'read':
        return message.leido && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
      </div>
    </div>
  );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mensajes de Contacto</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar mensajes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <span key={`icon-${tab.id}`} className="w-5 h-5 mr-2">
                    <Icon />
                  </span>
                  <span key={`label-${tab.id}`}>{tab.label}</span>
                  {tab.id !== 'all' && (
                    <span
                      key={`count-${tab.id}`}
                      className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                    >
                      {messages.filter(m => tab.id === 'unread' ? !m.leido : m.leido).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay mensajes</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm
              ? 'No se encontraron mensajes que coincidan con tu búsqueda'
              : activeTab === 'unread'
              ? 'No hay mensajes sin leer'
              : activeTab === 'read'
              ? 'No hay mensajes leídos'
              : 'No hay mensajes para mostrar'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                !message.leido ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {message.nombre} {message.apellido}
                  </h3>
                  <p className="text-gray-600">{message.correoElectronico}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {format(new Date(message.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </span>
                  {!message.leido && (
                    <button
                      onClick={() => handleMarkAsRead(message._id)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      title="Marcar como leído"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-4 text-gray-700 whitespace-pre-wrap">{message.mensaje}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages; 