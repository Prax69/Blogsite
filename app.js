require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');



const connectDB = require("./server/config/db.js");
const {isActiveRoute} = require("./helpers/routeHelpers.js");

const app = express();
const PORT = 5000 || process.env.PORT;

connectDB();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret : "keyboard cat",
    resave : false,
    saveUnitialized : true,
    store : MongoStore.create({mongoUrl : process.env.MONGODB_URI}),
}));

app.use(express.static('public'));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;


app.use('/', require('./server/routes/main.js'));
app.use('/', require('./server/routes/admin.js'));

// app.get("/about", require("./server/routes/main.js"));
// app.get("/post/:id", require("./server/routes/main.js"));
// app.post("/search", require("./server/routes/main.js"));

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})