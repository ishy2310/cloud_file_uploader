const express = require('express');
const multer = require('multer');
const path= require('path');
const pool=require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        const unique=Date.now()+'-'+ Math.round(Math.random()*1E9);
        const ext = path.extname(file.originalname);
        cb(null,file.fieldname+'-'+unique+ext);

    }
})



  


const upload =multer({storage:storage});

app.use(express.static(path.join(__dirname,'views')));


app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/',(req,res)=>{
    res.send('Backend Working');
});

app.get('/files',async(req,res)=>{
    try{
        const result = await pool.query('SELECT * FROM files ORDER BY upload_time DESC');
        res.json(result.rows);

    }catch(err){
        console.error(err);
        res.status(500).json({error:'Server Error'});
    }
})

app.post('/upload',upload.single('file'),async(req,res)=>{
    if(!req.file){
        return res.status(400).send('Please Select a File');
    }
    const{originalname,filename,size,path}=req.file;

    try{
        await pool.query(
            'INSERT INTO files(original_name, stored_name, size, path) VALUES($1,$2,$3,$4)',[originalname,filename,size,path]
        );
        res.status(200).json({
            message:'File uploaded successfully and saved to databse',
            originalname:originalname,
            storedName:filename,
            size,
            path
    
        });
    }catch(err){
        console.error(err);
        res.status(500).json({error:'Database Error'});
    }

   
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log('http://localhost:3000');
console.log('http://localhost:3000/upload');
console.log('http://localhost:3000/index.html');