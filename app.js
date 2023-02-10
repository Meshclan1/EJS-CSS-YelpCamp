if (process.env.NODE_ENV!=="production") {
    require('dotenv').config();
}

// Here, process.env.NODE_ENV is environment variable. We are placing it in development mode only as there is another way to do it in production

const express=require("express");
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate'); // Ejs-mate is used for adding more functionality to our ejs partials. It allows us to create boilerplates, reducing the need for duplicate code
const session=require('express-session');
const flash=require('connect-flash');
const ExpressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('./models/user');
const mongoSanitize=require('express-mongo-sanitize'); // Mongo sql injection
const helmet=require("helmet"); // Helmet.js is a Node.js module that helps in securing HTTP headers. It is implemented in express applications. Therefore, we can say that helmet.js helps in securing express applications
const MongoStore=require("connect-mongo"); // To store our session in the cloud
const users=require('./routes/users');
const campgrounds=require('./routes/campgrounds');
const reviews=require('./routes/reviews');


const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';


//Database (DB) connect
mongoose.set('strictQuery', false)
mongoose.connect(dbUrl).
    catch(error => handleError(error));

const db=mongoose.connection;
db.on('error', console.error.bind(console, 'Oh no Mongo connection error..'));
db.once('open', () => {
    console.log('Mongo Connection Open!!');
});


// mongoose.set('strictQuery', false)
// mongoose.connect(dbUrl,
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     })
//     .then(() => {
//         console.log("Mongo Connection Open!!")
//     })
//     .catch(err => {
//         console.log("Oh no Mongo connection error..")
//         console.log(err)
//     })

const app=express();

app.engine('ejs', ejsMate); // use ejs mate instead of ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))


//post request settings
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Configuring static files
app.use(express.static(path.join(__dirname, 'public')));

// Not allowing certain keywords via query strings or param requests like $gt
app.use(mongoSanitize());


// Configuring session
const secret=process.env.SECRET||'thisshouldbeabettersecret'

const sessionConfig={
    store: MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret,
        },
        touchAfter: 24*3600 // time period in seconds
    }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // For security purposes, set to restrict cookie access via JS
        //secure:true, // enable https session security but it will affect our develpmemnt server, use while hoisting only
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet())



// ---------------------------- Content security ----------------------------------------------------
// The following decides what is allowed and what is not 
// For eg fonts sources, icons sources, image sources indicate what is allowed

const scriptSrcUrls=[
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls=[
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls=[
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls=[];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnk9sziva/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// For Authentication we use: npm i passport passport-local passport-local-mongoose
app.use(passport.initialize());
app.use(passport.session()); // passport.session must always be after session
passport.use(new localStrategy(User.authenticate())); // We use the local strategy with user model and authenticate the function which is created by passport local mongoose

passport.serializeUser(User.serializeUser()); // How to store it in session
passport.deserializeUser(User.deserializeUser()); // How to UNstore it in session


app.use((req, res, next) => {
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})


// ---------------------------- Route Handlers ----------------------------------------------------
app.get('/', (req, res) => {
    res.render('home')
});


// Campgrounds Route
app.use('/campgrounds', campgrounds);
// Reviews Route
app.use('/campgrounds/:id/reviews', reviews);
// Authentication Route
app.use('/', users);


app.get('/results', async (req, res) => {
    const { search_query }=req.query
    const campgrounds=await Campground.find({ title: { $regex: search_query, $options: "i" } })
    res.render('search.ejs', { campgrounds, search_query })
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found..', 404))
})


// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode=500 }=err;
    if (!err.message) err.message='Oh no, something went wrong!'
    res.status(statusCode).render('error', { err }) // For development
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
});



