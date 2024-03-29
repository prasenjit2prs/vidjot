const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dialog = require('dialog-node');
const methodOverride = require('method-override');




// intializing express app
const app = express();

// Method Override middleware
app.use(methodOverride('_method'));

// mongodb middleware
mongoose.connect("mongodb://localhost/vidjotdb", { useNewUrlParser: true})
    .then( () => console.log('MongoDB connected....'))
    .catch(err => console.log(err));

// Load Idea model
require('./models/Idea');   
const Idea = mongoose.model('ideas');

// Express handlebars middleware
app.engine('hbs', hbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs');

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Express static folder
app.use(express.static(__dirname + '/public'));

// Intializing port
const port = 5000;

// GET index route
app.get('/', (req, res) => {
    var title = 'Home';
    res.render('index', {title});
});

// GET about route
app.get('/about', (req, res) => {
    var title = 'About';
    res.render('about', {title});
});

// Ideas Lists
app.get('/ideas', (req, res) => {
    Idea.find()
        .sort({date: 'desc'})
        .then((ideas) => {
            res.render('ideas/index', {
                ideas: ideas,
                title: 'Ideas'
            })
        });
});

// Add ideas form route
app.get('/ideas/add', (req, res) => {
    var title = 'Add Ideas';
    res.render('ideas/add', {title});
});

// Process add idea form
app.post('/ideas', (req, res) => {
    const newUser = {
        title: req.body.title,
        details: req.body.details
    };

    new Idea(newUser)
        .save()
        .then((ideas) => {
            console.log('Data saved to db..');
            res.redirect('/ideas');
        });
});

// Edit ideas form route
app.get('/ideas/edit/:id', (req, res) => {
    const title = 'Edit Idea';
    Idea.findOne({ _id: req.params.id})
        .then((idea) => {
            //console.log(idea);
            res.render('ideas/edit', {title, idea});
        });
});

// Process Edit form PUT request
app.put('/ideas/edit/:id', (req, res) => {
    Idea.findOne({_id: req.params.id})
        .then((idea) => {
            // new values
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(idea => {
                    res.redirect('/ideas');
                });
        });
});

// Process Delete idea request
app.delete('/ideas/:id', (req, res) => {
    Idea.findOne({_id: req.params.id})
        .then(idea => {

            idea.remove()
                .then(idea => {
                    console.log(`Idea Deleted with id ${idea._id}`);
                    res.redirect('/ideas');
                });

            // dialog.question(`Are you sure want to delete ${idea.title}`,'Confirm','',(code, retVal, stderr) => {
            //     if (retVal == "OK") {
            //         idea.remove()
            //         .then(idea => {
            //             console.log(`Idea Deleted with id ${idea._id}`);
            //             res.redirect('/ideas');
            //         });
            //     } else {
            //         res.redirect('/ideas');
            //     }
            // });
        });
});


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})