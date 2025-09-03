import React, { useEffect, useState } from 'react';
import userService, { User } from '../services/user.service';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const FinancialPagosPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abonos, setAbonos] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [totalDeudaComision, setTotalDeudaComision] = useState(0);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
  setLoading(true);
  try {
    const users = await userService.getProfessionals();
    setProfessionals(users);

    const totalDeuda = users.reduce((acc: number, p: any) => {
      const pend = p?.saldoPendiente;
      return acc + pend;
    }, 0);

    setTotalDeudaComision(totalDeuda);
  } catch (err) {
    console.error('Error cargando profesionales:', err);
    toast.error('Error al cargar profesionales');
  } finally {
    setLoading(false);
  }
};

  const handleAbonoChange = (id: string, value: string) => {
    setAbonos({ ...abonos, [id]: value });
  };

  const handleAbonar = async (id: string) => {
    setSaving({ ...saving, [id]: true });
    const abono = parseFloat(abonos[id] || '0');
    if (abono > 0) {
      await userService.abonarComision(id, abono);
      // Actualizar el saldo total del profesional localmente
      await fetchProfessionals();
      setAbonos({ ...abonos, [id]: '' });
    }
    setSaving({ ...saving, [id]: false });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Pagos de Profesionales</h1>
      <div className="mb-4 text-lg font-semibold text-red-700">
        Pagos pendientes totales con el instituto: ${totalDeudaComision.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="px-4 py-2">Profesional</th>
              <th className="px-4 py-2">Saldo Total</th>
              <th className="px-4 py-2">Comisión (%)</th>
              <th className="px-4 py-2">Deuda Actual</th>
              <th className="px-4 py-2">Abonar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
            ) : professionals.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4">No hay profesionales registrados</td></tr>
            ) : professionals.map((prof: User) => {
              return (
                <tr key={prof.id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="text-center px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{prof.name}</td>
                  <td className="text-center px-4 py-2 whitespace-nowrap">${prof.saldoTotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                  <td className="text-center px-4 py-2 whitespace-nowrap">{prof.commission}%</td>
                  <td className="text-center px-4 py-2 text-red-600 font-semibold whitespace-nowrap">${prof.saldoPendiente.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 items-center justify-end">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={abonos[prof.id] || ''}
                        onChange={e => handleAbonoChange(prof.id, e.target.value)}
                        className="border rounded px-2 py-1 w-24"
                        disabled={saving[prof.id]}
                      />
                      <Button
                        onClick={() => handleAbonar(prof.id)}
                        disabled={saving[prof.id] || !abonos[prof.id] || parseFloat(abonos[prof.id]) <= 0}
                      >
                        {saving[prof.id] ? 'Abonando...' : 'Abonar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialPagosPage; 