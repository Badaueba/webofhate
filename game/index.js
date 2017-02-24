var main = require('./main/main.js');
require('./main/data.js');
require('./gameplay/gameplay.js');
require('./main/home.js');
require('./menu/menu');
require('./http/requests');
require('./auth/auth')();

main();