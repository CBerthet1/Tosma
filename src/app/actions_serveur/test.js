// scripts/add-reservation.js
import mysql from 'mysql2/promise';

async function main() {
  try {
    // 1. Connexion à la base
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'poney',
      database: 'db_site',
    });

    console.log('✅ Connexion réussie !');

    // 2. Ajouter une réservation
    await connection.execute(`
      INSERT INTO resa_table (name, start, end) 
      VALUES ('SteakHechehe', '2026-11-18 18:00:00', '2026-11-19 19:00:00')
    `);

    console.log('✅ Réservation créée avec succès !');

    // 3. Vérifier que c'est bien ajouté
    const [rows] = await connection.execute('SELECT * FROM resa_table');
    console.log('📋 Liste des réservations :');
    rows.forEach(row => {
      console.log(`   - ${row.name}: ${row.start} -> ${row.end}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Vérifie que MySQL tourne : docker start mysql-dev');
    }
    if (error.message.includes('Unknown database')) {
      console.error('💡 Vérifie que la base "mon_app" existe');
    }
    if (error.message.includes('Table')) {
      console.error('💡 Vérifie que la table "resa_table" existe');
    }
  }
}

main();