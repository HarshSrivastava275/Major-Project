if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash");
const listingRouter = require("./routes/listing.js"); 
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local"); 
const User = require("./models/user.js"); 
const userRouter = require("./routes/user.js");
port = 8080;

const dbUrl = process.env.ATLASDB_URL;

main().then((res)=>{
    console.log("connected to Database");
}).catch((err)=>{
    console.log(err); 
});
 
async function main() {
   await mongoose.connect(dbUrl);
} 

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views")); 
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=>{
    console.log("error in mongo session store", err);
});

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};  


// app.get("/",(req, res)=>{
//     res.send("hii i am home page");
// });





app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





  


// app.get("/testListing",async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location:"Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save(); 
//     console.log("sample was save");
//     res.send("successful testing");
// });

app.use((req, res, next)=>{
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req, res)=>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });
//   let registerUser = await User.register(fakeUser, "helloworld");
//   res.send(registerUser);
// })


app.use("/listings", listingRouter);  
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"));  
});

app.use((err, req, res, next)=>{
    console.log(err);
    let {statusCode=500, message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{ message });
    // res.status(statusCode).send(message);
});



app.listen(port, ()=>{
    console.log(`listening onn port ${port}`);
});