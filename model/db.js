const mysql=require('mysql2');
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'admin',
    database:'pos',
    port:'3308'

});

db.connect((err)=>{
    if(err){
        console.error('error connecting to database:',err);
        return;
    }
    console.log('connected');
});

module.exports=db;