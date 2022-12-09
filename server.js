const express = require('express');
const bodyParser = require("body-parser");
const https = require('https');
const fs = require('fs');
const {v4 : uuidv4} = require("uuid");
const port = 4043;
const app = express();
const {createClient} = require('redis');
const md5 = require('md5');

let loginAttemptCount = {};

const redisClient = createClient(
    {
        url: "redis://localhost:6379",
    }
);

//const redisClient = createClient(
//{
//    url:`redis://default:${process.env.REDIS_PASS}@redis-stedi-jade:6379`
//}    
//);

app.use(bodyParser.json());

https.createServer({
    key: fs.readFileSync('./SSL/server.key'),
    cert: fs.readFileSync('./SSL/server.cert'),
    ca: fs.readFileSync('./SSL/chain.pem')
    
}, app).listen(port, async () => {
    console.log('listening...')
    try{
    await redisClient.connect();
    console.log('listening...')}
    catch(error){
            console.log(error)
        }
    });

// app.listen(port, async ()=>{
//     await redisClient.connect();
//     console.log('listening on port'+port);
// });

app.get('/', (req,res)=>{
    res.send('Hello World')
});

app.post('/user', (req,res)=>{
    const newUserRequestObject = req.body;
    const loginPassword = req.body.password;
    const hash = md5(loginPassword);
    console.log(hash);
    newUserRequestObject.password=hash;
    newUserRequestObject.verifyPassword=hash;
    console.log('New User:' ,JSON.stringify(newUserRequestObject));
    redisClient.hSet('users',req.body.email,JSON.stringify(newUserRequestObject));
    
    res.send('New user'+newUserRequestObject.email+' added');
});

app.post("/login", async (req,res)=>{
    const loginEmail =req.body.userName;
    console.log(JSON.stringify(req.body));
    console.log("loginEmail", loginEmail);
    const loginPassword = req.body.password;
    console.log("loginPassword", loginPassword);
    //res.send("Who are you?");

    const userString=await redisClient.hGet('users', loginEmail);
    const userObject=JSON.parse(userString)
    if(userString=='' || userString==null){
            res.status(404);
            res.send('User not found');
    }
    else if (loginEmail == userObject.userName && loginPassword == userObject.password){
        const token = uuidv4();
        res.send(token);
    } else{
        res.status(401);
        res.send("Invalid User or Password.");
    }
})