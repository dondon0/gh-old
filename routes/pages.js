const express=require('express');
const authController=require('../controllers/auth');
const router=express.Router();



router.get('/',authController.isLoggedin,(req,res)=>{
    res.render('index', {
    user:req.user
    });
    
});

router.get('/register',(req,res)=>{
    res.render('register');
});

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/suggestions',authController.isLoggedin,(req,res)=>{
    res.render('suggestions',{
        user:req.user
    });
    
});

router.get('/logout',authController.logout,(req,res)=>{
    res.render('index');
});

router.get('/games',authController.isLoggedin,(req,res)=>{
    res.render('games',{
        user:req.user
    });
});

router.get('/about',(req,res)=>{
    res.render('about');
});






module.exports=router;