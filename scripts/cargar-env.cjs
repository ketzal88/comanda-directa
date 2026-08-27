// Carga .env.local antes de que corra el script (seed, etc.), igual que en
// presencia-carta y sagrado-sushi-carta.
require('dotenv').config({ path: '.env.local' });
