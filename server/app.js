require("dotenv").config();
const express = require("express");
const app=express();
const cors=require("cors");
require("./db/conn")
const PORT=6005;
const session=require("express-session");
const passport=require("passport");
const userdb = require("./model/userschema");
const oAuth2Strategy=require("passport-google-oauth2").Strategy;
const clientid=process.env.clientid;;
const clientsecret=process.env.clientsecret;
const router=express.Router();
app.use(cors({
 origin: "http://localhost:3000",
 methods:"GET,POST,PUT,DELETE",
 credentials: true
}));
app.use(express.json());
app.get("/",(req,res)=>{
    res.status(200).json("server start");
});
app.use(session({
    secret:clientsecret,
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new oAuth2Strategy({
        clientID:clientid,
        clientSecret:clientsecret,
        callbackURL:"/auth/google/callback",
        scope:["profile","email"]
    },
    async(accessToken,refreshToken,profile,done)=>{
        console.log("profile",profile);
        try {let user=await userdb.findOne({googleId:profile.id});
        if(!user){
            user = new userdb({
                googleId:profile.id,
                displayName:profile.displayName,
                email:profile.emails[0].value,
                image:profile.photos[0].value
            });

            await user.save();
        }

        return done(null,user)
    } catch (error) {
        return done(error,null)
    }
}
)
)
passport.serializeUser((user,done)=>{
    done(null,user);
}
)
passport.deserializeUser((user,done)=>{
    done(null,user);
}
)

app.get("/auth/google",passport.authenticate());
app.get("/auth/google/callback",passport.authenticate("google",{
    successRedirect:"http://localhost:3000/home",
    failureRedirect:"http://localhost:3000/login"
}));
app.listen(PORT,()=>{
    console.log(`server started at ${PORT}`);
})

app.get('/profile',(res,req)=>{
    res.json(req.user);
})