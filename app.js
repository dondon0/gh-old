const express= require("express");
const path=require('path');
const mysql=require("mysql");
const dotenv=require("dotenv");
const cookieparser=require("cookie-parser");
const PORT=process.env.PORT||8000;


dotenv.config({path:'./.env'});
const app=express();

var dbconfig={
    host:"us-cdbr-east-02.cleardb.com",
    user:"bdc526cefd8f1d",
    password:"3da85455", 
    database:"heroku_cf5c3432e8d2016",
    port:"3306"
};

var connection;

function handleDisc(){
    connection=mysql.createConnection(dbconfig);

    connection.connect(function(error){
        if(error){
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error',function(error){
        console.log('database error', error);
        if(error.code==='PROTOCOL_CONNECTION_LOST'){
            handleDisc();
        }
        else{
            throw error;
        }
    });
}

handleDisc();



  



const publicDirectory= path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieparser());

app.set('view engine','hbs');



//Defining routes for where to go if file is accessed
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(PORT,()=>{
    console.log(`Our app is running on port ${ PORT }`);
}); 