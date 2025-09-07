import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService, { User } from '../../services/user.service';
import {
	CurrencyDollarIcon,
	ArrowTrendingUpIcon,
	ExclamationCircleIcon,
	ArrowPathIcon,
	CalendarIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import patientsService from '../../services/patients.service';
import appointmentsService from '../../services/appointments.service';

interface FinancialStats {
	totalRevenue: number;
	pendingPayments: number;
	completedAppointments: number;
	averagePayment: number;
	recentTransactions: Array<{
		id: string;
		patientName: string;
		amount: number;
		date: string;
		type: string;
	}>;
	paymentsByProfessional: Array<{
		professionalName: string;
		totalAmount: number;
		pendingAmount: number;
	}>;
}

const FinancialDashboard: React.FC = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState<FinancialStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	// Eliminar: const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');
	const [professionals, setProfessionals] = useState<User[]>([]);
	const [selectedProfessional, setSelectedProfessional] = useState<User | null>(
		null
	);
	const [totalSaldoProfesionales, setTotalSaldoProfesionales] = useState(0);
	const [totalDeudaComision, setTotalDeudaComision] = useState(0);
	const [recentAbonos, setRecentAbonos] = useState<
		{ name: string; amount: number; date: string }[]
	>([]);

	useEffect(() => {
		loadFinancialStats();
		loadProfessionals();
		loadRecentAbonos();
	}, []); // Eliminar dependencia de dateRange

	const loadFinancialStats = async () => {
		try {
			setIsLoading(true);
			const appointments = await appointmentsService.getAllAppointments();

			// En loadFinancialStats, eliminar el filtrado por rango de fechas y usar todas las citas
			// Calcular estadísticas
			const completedAppointments = appointments.filter(
				(a) => a.status === 'completed'
			);
			const totalRevenue = completedAppointments.reduce(
				(sum, a) => sum + (a.paymentAmount || 0),
				0
			);
			const pendingPayments = completedAppointments.reduce(
				(sum, a) => sum + (a.remainingBalance || 0),
				0
			);
			const averagePayment =
				completedAppointments.length > 0
					? totalRevenue / completedAppointments.length
					: 0;

			// Agrupar pagos por profesional
			const professionalPayments = completedAppointments.reduce(
				(acc, appointment) => {
					const professional = acc.find(
						(p) => p.professionalName === appointment.professionalName
					);
					if (professional) {
						professional.totalAmount += appointment.paymentAmount || 0;
						professional.pendingAmount += appointment.remainingBalance || 0;
					} else {
						acc.push({
							professionalName: appointment.professionalName,
							totalAmount: appointment.paymentAmount || 0,
							pendingAmount: appointment.remainingBalance || 0,
						});
					}
					return acc;
				},
				[] as Array<{
					professionalName: string;
					totalAmount: number;
					pendingAmount: number;
				}>
			);

			// Obtener transacciones recientes
			const recentTransactions = completedAppointments
				.filter((a) => a.paymentAmount && a.paymentAmount > 0)
				.map((a) => ({
					id: a.id,
					patientName: a.patientName,
					amount: a.paymentAmount || 0,
					date: a.completedAt || a.date,
					type: a.type,
				}))
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				.slice(0, 5);

			setStats({
				totalRevenue,
				pendingPayments,
				completedAppointments: completedAppointments.length,
				averagePayment,
				recentTransactions,
				paymentsByProfessional: professionalPayments,
			});
		} catch (error) {
			console.error('Error al cargar estadísticas financieras:', error);
			toast.error('Error al cargar las estadísticas');
		} finally {
			setIsLoading(false);
		}
	};

	const loadProfessionals = async () => {
		try {
			const users = await userService.getProfessionals();
			setProfessionals(users);
			// Calcular saldo pendiente de pacientes para cada profesional
			const { totalSaldo, totalDeuda } = users.reduce(
				(acc, { saldoTotal, saldoPendiente }) => ({
					totalSaldo: acc.totalSaldo + saldoTotal,
					totalDeuda: acc.totalDeuda + saldoPendiente,
				}),
				{ totalSaldo: 0, totalDeuda: 0 }
			);

			setTotalSaldoProfesionales(totalSaldo);
			setTotalDeudaComision(totalDeuda);
		} catch (error) {
			toast.error('Error al cargar profesionales');
		}
	};

	const loadRecentAbonos = async () => {
		try {
			const abonos = await userService.getAbonos();
			// Ordenar por fecha descendente y tomar los 5 más recientes
			const recientes = abonos
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				.slice(0, 5)
				.map((a) => ({
					name: a.professionalName,
					amount: a.amount,
					date: a.date,
				}));
			setRecentAbonos(recientes);
		} catch (error) {
			setRecentAbonos([]);
		}
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadFinancialStats();
		setIsRefreshing(false);
		toast.success('Datos actualizados');
	};

	// Función para generar el PDF de un profesional
	const generateProfessionalPDF = async (prof: User) => {
		const doc = new jsPDF();
		const now = new Date();
		const fecha = now.toLocaleString('es-ES', {
			dateStyle: 'long',
			timeStyle: 'short',
		});
		const porcentajeIppl =
			typeof prof.commission === 'number' ? prof.commission : 0;
		const saldoTotal = Number(prof.saldoTotal) || 0;
		const abonos = Number(prof.saldoPendiente) || 0;
		const saldoIppl = saldoTotal * (porcentajeIppl / 100);
		const deudaComision = Math.max(saldoIppl - abonos, 0);
		const saldoNeto = saldoTotal - saldoIppl;
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(16);
		doc.text('Instituto Psicológico y Psicoanálisis del Litoral', 105, 12, {
			align: 'center',
		});
		doc.setFontSize(18);
		doc.text(`Resumen Financiero de ${prof.name}`, 10, 28);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(11);
		doc.text(`Fecha de generación: ${fecha}`, 10, 36);
		doc.setLineWidth(0.5);
		doc.line(10, 39, 200, 39);
		doc.setFontSize(12);
		doc.text(`Email: ${prof.email}`, 10, 48);
		doc.text(`Saldo Total: $${saldoTotal.toFixed(2)}`, 10, 56);
		doc.text(`Porcentaje del IPPL: ${porcentajeIppl}%`, 10, 64);
		doc.text(`Descuento IPPL: $${saldoIppl.toFixed(2)}`, 10, 72);
		doc.text(`Saldo Neto (profesional): $${saldoNeto.toFixed(2)}`, 10, 80);
		let y = 88;
		doc.setLineWidth(0.1);
		doc.line(10, y + 4, 200, y + 4);
		y += 10;
		// Obtener pacientes con deuda
		const patients = await patientsService.getProfessionalPatients(prof.id);
		const appointments = await appointmentsService.getProfessionalAppointments(
			prof.id
		);
		const patientsWithDebt = patients
			.map((patient: any) => {
				const debt = appointments
					.filter(
						(a: any) =>
							a.patientId === patient.id &&
							a.status === 'completed' &&
							a.attended
					)
					.reduce(
						(acc: number, curr: any) => acc + (curr.remainingBalance || 0),
						0
					);
				return { name: patient.name, debt };
			})
			.filter((p: any) => p.debt > 0);
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(14);
		doc.text('Pacientes con Deuda:', 10, y);
		y += 8;
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(12);
		if (patientsWithDebt.length === 0) {
			doc.text('Ningún paciente tiene deuda pendiente.', 10, y);
		} else {
			// Encabezado de tabla
			doc.setFillColor(230, 230, 230);
			doc.rect(10, y - 5, 190, 8, 'F');
			doc.setFont('helvetica', 'bold');
			doc.text('Nombre', 15, y);
			doc.text('Deuda', 180, y, { align: 'right' });
			y += 7;
			doc.setFont('helvetica', 'normal');
			patientsWithDebt.forEach((p: any) => {
				doc.text(p.name, 15, y);
				doc.text(`$${p.debt.toFixed(2)}`, 180, y, { align: 'right' });
				y += 7;
				if (y > 270) {
					doc.addPage();
					y = 20;
				}
			});
		}
		doc.save(`Resumen_${prof.name.replace(/ /g, '_')}.pdf`);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-8">
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							Panel Financiero
						</h1>
						<p className="mt-1 text-gray-600">
							Resumen financiero y estadísticas
						</p>
					</div>
					<div className="flex items-center gap-4">
						{/* Eliminar el select de rango de fechas */}
						<button
							onClick={handleRefresh}
							className={`flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${
								isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
							}`}
							disabled={isRefreshing}
						>
							<ArrowPathIcon
								className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
							/>
							Actualizar datos
						</button>
					</div>
				</div>

				{stats && (
					<>
						{/* Estadísticas Principales */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
								<div className="flex items-center">
									<div className="bg-green-500/10 p-3 rounded-lg">
										<CurrencyDollarIcon className="h-6 w-6 text-green-600" />
									</div>
									<div className="ml-4">
										<h3 className="text-2xl font-bold text-gray-900">
											$
											{totalSaldoProfesionales.toLocaleString('es-CO', {
												minimumFractionDigits: 2,
											})}
										</h3>
										<p className="text-sm text-gray-600">
											Saldo Total Profesionales
										</p>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
								<div className="flex items-center">
									<div className="bg-red-500/10 p-3 rounded-lg">
										<ExclamationCircleIcon className="h-6 w-6 text-red-600" />
									</div>
									<div className="ml-4">
										<h3 className="text-2xl font-bold text-gray-900">
											$
											{totalDeudaComision.toLocaleString('es-CO', {
												minimumFractionDigits: 2,
											})}
										</h3>
										<p className="text-sm text-gray-600">
											Pagos Pendientes con el Instituto
										</p>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
								<div className="flex items-center">
									<div className="bg-blue-500/10 p-3 rounded-lg">
										<CalendarIcon className="h-6 w-6 text-blue-600" />
									</div>
									<div className="ml-4">
										<h3 className="text-2xl font-bold text-gray-900">
											{stats?.completedAppointments || 0}
										</h3>
										<p className="text-sm text-gray-600">Citas Completadas</p>
									</div>
								</div>
							</div>
						</div>

						{/* Transacciones Recientes y Resumen por Profesional */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Transacciones Recientes */}
							<div className="bg-white rounded-xl shadow p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Transacciones Recientes
								</h3>
								<div className="space-y-4">
									{recentAbonos.length === 0 ? (
										<div className="text-gray-500">No hay abonos recientes</div>
									) : (
										recentAbonos.map((abono, idx) => (
											<div
												key={idx}
												className="items-center justify-between p-4 bg-gray-50 rounded-lg"
											>
												<div className="flex items-center">
													<UserGroupIcon className="h-8 w-8 text-gray-400" />
													<div className="ml-4">
														<p className="text-sm font-medium text-gray-900">
															{abono.name}
														</p>
														<p className="text-xs text-gray-500">
															{new Date(abono.date).toLocaleDateString(
																'es-ES',
																{
																	year: 'numeric',
																	month: 'long',
																	day: 'numeric',
																}
															)}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm font-semibold text-green-600">
														+$
														{abono.amount.toLocaleString('es-CO', {
															minimumFractionDigits: 2,
														})}
													</p>
													<p className="text-xs text-gray-500">Abono</p>
												</div>
											</div>
										))
									)}
								</div>
							</div>

							{/* Resumen por Profesional */}
							<div className="bg-white rounded-2xl shadow p-6">
								<h2 className="text-xl font-bold mb-4 items-center gap-2">
									<UserGroupIcon className="h-6 w-6 text-blue-600" /> Resumen
									por Profesional
								</h2>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Nombre
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Saldo Total
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Saldo Pendiente
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Acciones
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{professionals.map((prof) => {
												const saldo = prof.saldoTotal;
												const saldoPendientePacientes = prof.saldoPendiente;
												console.log(saldoPendientePacientes);
												return (
													<tr key={prof.id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap">
															{prof.name}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															${saldo}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
															${saldoPendientePacientes}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<button
																onClick={() => setSelectedProfessional(prof)}
																className="text-blue-600 hover:text-blue-900 font-medium mr-2"
															>
																Ver Detalle
															</button>
															<button
																onClick={() => generateProfessionalPDF(prof)}
																className="text-green-600 hover:text-green-900 font-medium"
															>
																Generar PDF
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Modal de Detalle de Profesional */}
			{selectedProfessional && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-semibold mb-4">
							Detalle de Profesional
						</h2>
						<div className="mb-2">
							<span className="font-bold">Nombre:</span>{' '}
							{selectedProfessional.name}
						</div>
						<div className="mb-2">
							<span className="font-bold">Email:</span>{' '}
							{selectedProfessional.email}
						</div>
						<div className="mb-2">
							<span className="font-bold">Saldo Total:</span> $
							{(selectedProfessional.saldoTotal || 0).toFixed(2)}
						</div>
						<div className="mb-4">
							<span className="font-bold">Saldo Pendiente:</span> $
							{(selectedProfessional.saldoPendiente || 0).toFixed(2)}
						</div>
						<div className="flex justify-end">
							<button
								onClick={() => setSelectedProfessional(null)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
							>
								Cerrar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default FinancialDashboard;
