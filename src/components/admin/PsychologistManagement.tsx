import React, { useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, User, Calendar } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

interface PsychologistData {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  patients: number;
  consultations: number;
  status: 'active' | 'inactive';
  profilePicture?: string;
}

// Mock data for demonstration
const MOCK_PSYCHOLOGISTS: PsychologistData[] = [
  {
    id: '1',
    name: 'Dra. María González',
    specialty: 'Psicología Clínica',
    email: 'maria@ippl.org',
    phone: '+54 11 1234-5678',
    patients: 48,
    consultations: 186,
    status: 'active',
    profilePicture: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '2',
    name: 'Dr. Carlos Rodríguez',
    specialty: 'Psicoterapia',
    email: 'carlos@ippl.org',
    phone: '+54 11 2345-6789',
    patients: 36,
    consultations: 145,
    status: 'active',
    profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '3',
    name: 'Lic. Ana Martínez',
    specialty: 'Psicología Infantil',
    email: 'ana@ippl.org',
    phone: '+54 11 3456-7890',
    patients: 42,
    consultations: 172,
    status: 'active',
    profilePicture: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: '4',
    name: 'Lic. Pablo Sánchez',
    specialty: 'Neuropsicología',
    email: 'pablo@ippl.org',
    phone: '+54 11 4567-8901',
    patients: 29,
    consultations: 118,
    status: 'inactive',
    profilePicture: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

const PsychologistManagement: React.FC = () => {
  const [psychologists] = useState<PsychologistData[]>(MOCK_PSYCHOLOGISTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter psychologists based on search term and filters
  const filteredPsychologists = psychologists.filter(psych => {
    const matchesSearch = 
      psych.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psych.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psych.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || psych.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Gestión de Profesionales</h1>
        
        <Button variant="primary" className="inline-flex items-center">
          <UserPlus size={16} className="mr-2" />
          Agregar Profesional
        </Button>
      </div>
      
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o email..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPsychologists.length > 0 ? (
          filteredPsychologists.map(psych => (
            <Card key={psych.id} className="h-full">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                  {psych.profilePicture ? (
                    <img 
                      src={psych.profilePicture} 
                      alt={psych.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={36} className="text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{psych.name}</h3>
                      <p className="text-primary font-medium">{psych.specialty}</p>
                    </div>
                    
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      psych.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {psych.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-500">{psych.email}</p>
                    <p className="text-sm text-gray-500">{psych.phone}</p>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-primary/10 rounded-md p-3">
                      <div className="flex items-center">
                        <User size={16} className="text-primary mr-2" />
                        <span className="text-sm font-medium">Pacientes</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{psych.patients}</p>
                    </div>
                    
                    <div className="bg-primary/10 rounded-md p-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-primary mr-2" />
                        <span className="text-sm font-medium">Consultas</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{psych.consultations}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="inline-flex items-center">
                      <Edit2 size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="inline-flex items-center text-red-600 border-red-300 hover:bg-red-50">
                      <Trash2 size={14} className="mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="lg:col-span-2">
            <Card>
              <p className="text-center text-gray-500">
                No se encontraron profesionales con los criterios de búsqueda.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologistManagement;