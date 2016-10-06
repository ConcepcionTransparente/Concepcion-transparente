var mongoose = require('mongoose');

// mongoose.connect('mongodb://heroku_0n621108:hgsolivj50plo8bvbmckme8sa9@ds035856.mlab.com:35856/heroku_0n621108');

mongoose.connect('mongodb://heroku_0n621108:hgsolivj50plo8bvbmckme8sa9@ds035856.mlab.com:35856/heroku_0n621108', function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server.', err);
    } else {
        console.log('Connected to Server successfully');
    }
});
