let dev_URL = 'http://localhost:3000';
let prod_URL = 'https://kingshireproject.herokuapp.com'
//var socket = io.connect(dev_URL);
var socket = io.connect(dev_URL, {secure: true});

export{socket, dev_URL, prod_URL}

