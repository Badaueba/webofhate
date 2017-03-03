var main = require('./main/main.js');

//socketfunctions 
require('./gameplay/socketFunctions/connect');
require('./gameplay/socketFunctions/listOfPlayers');
require('./gameplay/socketFunctions/newPlayer');
require('./gameplay/socketFunctions/removePlayer');
require('./gameplay/socketFunctions/moveEvent');


require('./main/data.js');
require('./gameplay/gameplay.js');
require('./main/home.js');
require('./menu/menu');
require('./http/requests');
require('./services/storage');
require('./auth/auth');

main();