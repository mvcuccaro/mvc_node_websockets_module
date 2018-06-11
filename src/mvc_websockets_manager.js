let createSockets = require('socket.io');

ws_module = function(arg_server, arg_init = {}){

	let sio 		= createSockets(arg_server);
	sio.socket_pool = arg_init.socket_pool ? arg_init.socket_pool : [];

	sio.on('connection', socket => {
		console.log('Socket connect from ' + socket.id);
		sio.socket_pool.push({socket_id: socket.id});
		addListeners(socket);
		socket.emit('connect_ack', {});
	});

	if( arg_init.ping_interval ){
		setInterval(() => {
			console.log('Server ping sent');
			console.log('To ' + sio.socket_pool.length  + ' clients');
			sio.sockets.emit('server_ping', {ping_date: new Date()});
		}, arg_init.ping_interval);
	}


	return sio;

	function addListeners(arg_socket){
		arg_socket.on('mvc_ping', () => {
			console.log('Client ping detected');
		})
		.on('init', (data) => {
			let index = sio.socket_pool.findIndex( obj => {
				return obj.socket_id == arg_socket.id;
			});
			if( index != -1 ){
				//merge the current pool record with incoming data
				sio.socket_pool[index] = Object.assign(sio.socket_pool[index], data);
				console.log('INIT DATA RECEIVED', sio.socket_pool[index]);
			}
		})
		.on('disconnect', () => {
			console.log('Socket disconnect');
			let index = sio.socket_pool.findIndex( obj => {
				return obj.socket_id == arg_socket.id;
			});
			if( index != -1 ){ sio.socket_pool.splice(index, 1); }
	};
}

module.exports = ws_module;
