const express = require('express');
const bodyParser = require("body-parser");
const {v4 : uuidv4} = require("uuid");
const port = 3000;
const app = express();
const {createClient} = require('redis');
const md5 = require('md5');
const redisClient = createClient(
{
    Url:'redis://default@localhost:6379'
}    
);

app.use(bodyParser.json());

app.listen(port, async ()=>{
    console.log('listening on port'+port);
});

app.get('/', (req,res)=>{
    res.send('Hello World')
});

app.post('/user', (req,res)=>{
    const newUserRequestObject = req.body;
    console.log('New User:' ,JSON.stringify(newUserRequestObject));
    redisClient.hSet('users',req.body.email,JSON.stringify(newUserRequestObject));
    res.send('New user'+newUserRequestObject.email+' added');
});

app.post("/login", (req,res)=>{
    const loginEmail =req.body.Username;
    console.log(JSON.stringify(req.body));
    console.log("loginEmail", loginEmail);
    const loginPassword = req.body.password;
    console.log("loginPassword", loginPassword);
    res.send("Who are you?");

    if (loginEmail == "walker.jade123@gmail.com" && loginPassword == "jade123"){
        const token = uuidv4();
        res.send(token);
    } else{
        res.status(401);
        res.send("Invalid User or Password.");
    }
})