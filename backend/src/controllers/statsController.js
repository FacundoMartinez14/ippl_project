const fs = require('fs').promises;
const path = require('path');

const getSystemStats = async (req, res) => {
  try {
    // Leer todos los archivos de datos
    const usersData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8'));
    const patientsData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/patients.json'), 'utf8'));
    const postsData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/posts.json'), 'utf8'));

    // Calcular estadísticas
    const stats = {
      users: {
        total: usersData.users.length,
        byRole: {
          admin: usersData.users.filter(u => u.role === 'admin').length,
          professional: usersData.users.filter(u => u.role === 'professional').length,
          content_manager: usersData.users.filter(u => u.role === 'content_manager').length
        },
        active: usersData.users.filter(u => u.status === 'active').length
      },
      patients: {
        total: patientsData.patients.length,
        active: patientsData.patients.filter(p => p.status === 'active').length,
        withAppointments: patientsData.patients.filter(p => p.nextAppointment).length,
        byProfessional: patientsData.patients.reduce((acc, p) => {
          if (p.professionalId) {
            acc[p.professionalId] = (acc[p.professionalId] || 0) + 1;
          }
          return acc;
        }, {})
      },
      posts: {
        total: postsData.posts.length,
        published: postsData.posts.filter(p => p.status === 'published').length,
        totalViews: postsData.posts.reduce((sum, p) => sum + (p.views || 0), 0),
        totalLikes: postsData.posts.reduce((sum, p) => sum + (p.likes || 0), 0),
        bySection: postsData.posts.reduce((acc, p) => {
          acc[p.section] = (acc[p.section] || 0) + 1;
          return acc;
        }, {})
      },
      appointments: {
        upcoming: patientsData.patients.filter(p => p.nextAppointment && new Date(p.nextAppointment) > new Date()).length,
        completed: patientsData.patients.reduce((sum, p) => 
          sum + (p.appointments?.filter(a => a.status === 'completed').length || 0), 0
        )
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas del sistema' });
  }
};

const getProfessionalStats = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const patientsData = JSON.parse(await fs.readFile(path.join(__dirname, '../data/patients.json'), 'utf8'));

    // Filtrar pacientes del profesional
    const professionalPatients = patientsData.patients.filter(p => p.professionalId === professionalId);

    const stats = {
      patients: {
        total: professionalPatients.length,
        active: professionalPatients.filter(p => p.status === 'active').length,
        withUpcomingAppointments: professionalPatients.filter(p => 
          p.nextAppointment && new Date(p.nextAppointment) > new Date()
        ).length
      },
      appointments: {
        completed: professionalPatients.reduce((sum, p) => 
          sum + (p.appointments?.filter(a => a.status === 'completed').length || 0), 0
        ),
        upcoming: professionalPatients.filter(p => 
          p.nextAppointment && new Date(p.nextAppointment) > new Date()
        ).length
      },
      notes: {
        total: professionalPatients.reduce((sum, p) => 
          sum + (p.notes?.length || 0), 0
        ),
        audio: professionalPatients.reduce((sum, p) => 
          sum + (p.notes?.filter(n => n.audioUrl).length || 0), 0
        )
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del profesional:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas del profesional' });
  }
};

module.exports = {
  getSystemStats,
  getProfessionalStats
}; 