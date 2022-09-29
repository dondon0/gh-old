const mysql=require("mysql");
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const {promisify}=require('util');


const db=mysql.createConnection({
    host:"us-cdbr-east-02.cleardb.com",
    user:"bdc526cefd8f1d",
    password:"3da85455", 
    database:"heroku_cf5c3432e8d2016",
    port:"3306"
});





exports.register=(req,res)=>{
    console.log(req.body);

    const{username,email,password,passwordConfirmation}=req.body;

    db.query('select email from users where email=? ',[email],async(error,result)=>{
        if(error){
            console.log(error);
        }

        if(result.length>0){
            return res.render('register',{
                message:"This email is already used"
            })
        }

        else if(password !==passwordConfirmation){
            return res.render('register',{
                message:"Passwords does not match"
            });
        }

        let hashedPass=await bcrypt.hash(password,8);

        db.query('insert into users set?',{username:username,email:email,password:hashedPass},(error,results)=>{
            if(error){
                console.log(error);
            }
            else{
                return res.render('login',{
                    message:"New user registered"
                });
            }
        });

    });
}

exports.login=async(req,res)=>{
try {
    const{email,password}=req.body;
    if(!email || !password){
        return res.status(400).render('login',{
            message:'Enter your email and password'
        });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        console.log(results);
        if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
          res.status(401).render('login', {
            message: 'Email or Password is incorrect'
          })
        } else {
          const id = results[0].id;
  
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });
  
          console.log("The token is: " + token);
  
          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          }
  
          res.cookie('jwt', token, cookieOptions );
          res.status(200).redirect("/");
        }
  
      })
  
    } catch (error) {
      console.log(error);
    }
}

exports.isLoggedin=async(req,res,next)=>{
    console.log(req.cookies);
    if(req.cookies.jwt){
        try {
            //Verifying token
            const decoded=await promisify(jwt.verify)(req.cookies.jwt,
                process.env.JWT_SECRET);

            console.log(decoded);

            //Check database if user exists
            db.query('select * from users where id=?',[decoded.id],(error,results)=>{
                console.log(results);

                if(!results){
                    return next();
                }

                req.user=results[0];
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
    }
    else{
        next();
    }
    
}

exports.logout=async(req,res)=>{
    res.cookie('jwt','logout',{
        expires: new Date(Date.now()+1*1000),
        httpOnly:true
    });
    
    res.status(200).redirect('/');

}

exports.submitSuggestion=(req,res)=>{
    console.log(req.body);
    const{email,suggestion}=req.body;
    db.query('insert into suggestions set?',{email:email,suggestion:suggestion},(error,results)=>{
        if(error){
            console.log(error);
        }
        else{
            return res.render('suggestions',{
                message:"Suggestion is sent! We'll make sure your voice is heard"
            });
        }
    

});
}

