const express = require('express')
const mysql = require('mysql2')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 3000

const fileupload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

//Database(MySql) configulation
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "Cs12345678",
        database: "RalinthipDatabase"
    }
)
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

//Middleware (Body parser)
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
// Body Parser Middleware
app.options('*', cors())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // Change "*" to your domain name to restrict access to specific domains
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileupload());

app.post('/car', function (req, res){

  const imageFile = req.files.imageFile;
  const fileName = Date.now() + imageFile.name;
  const imagePath = path.join(__dirname, 'imgcar', fileName);

  fs.writeFile(imagePath, imageFile.data, (err) => {
    if(err) throw err;
  });

    const { brand, model, year, color, price, gearType, fuelType, doors, seats} = req.body;

    if (!brand || !model || !year || !color || !price || !gearType || !fuelType || !doors || !seats) {
      return res.send({ 'message': 'ข้อมูลไม่ครบถ้วน', 'status': false });
  }
    //ป้องกันการโจมตีผ่านคำสั่ง SQL command (SQL Injection)
    let sql = "INSERT INTO car (brand, model, year, color, price, gearType, fuelType, doors, seats, imageFile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [brand, model, year, color, price, gearType, fuelType, doors, seats, fileName], function (err, result) {
      if (err) {
        //console.error('Error inserting product:', err);
        return res.send({ 'message': 'บันทึกข้อมูลไม่สำเร็จ', 'status': false });
      }
      res.send({ 'message': 'บันทึกข้อมูลสำเร็จ', 'status': true });
    });
  });

/*app.post('/car', function (req, res) {
    const { brand, model, year, color, price, gearType, fuelType, doors, seats, imageFile } = req.body;

    if (!brand || !model || !year || !color || !price || !gearType || !fuelType || !doors || !seats) {
      return res.send({ 'message': 'ข้อมูลไม่ครบถ้วน', 'status': false });
  }
    //ป้องกันการโจมตีผ่านคำสั่ง SQL command (SQL Injection)
    let sql = "INSERT INTO car (brand, model, year, color, price, gearType, fuelType, doors, seats, imageFile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [brand, model, year, color, price, gearType, fuelType, doors, seats, imageFile], function (err, result) {
      if (err) {
        //console.error('Error inserting product:', err);
        return res.send({ 'message': 'บันทึกข้อมูลไม่สำเร็จ', 'status': false });
      }
      res.send({ 'message': 'บันทึกข้อมูลสำเร็จ', 'status': true });
    });
  });*/
  
  app.get('/car/:carID', function (req, res) {
    const carID = req.params.carID;
    //ป้องกันการโจมตีผ่านคำสั่ง SQL command (SQL Injection)
    let sql = "SELECT * FROM car WHERE carID = ?";
    
    db.query(sql, [carID], function (err, result) {
      if (err) {
        console.error('Error fetching product:', err);
        return res.send({ 'message': 'ไม่สามารถดึงข้อมูลได้', 'status': false });
      }

      // ตรวจสอบว่าพบข้อมูลรถหรือไม่
      if (result.length > 0) {
        res.send({ 'message': 'ดึงข้อมูลสำเร็จ', 'status': true, 'data': result[0] });
      } else {
        res.send({ 'message': 'ไม่พบข้อมูลรถที่ร้องขอ', 'status': false });
      }
    });
  });

  app.get('/show/car/:filename', 
    function(req, res) {        
        const filepath = path.join(__dirname, 'imgcar', req.params.filename);        
        res.sendFile(filepath);
    }
);

  
app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
});