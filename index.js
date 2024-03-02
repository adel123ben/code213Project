const express = require('express')
const app = express()
const PORT = 5000
const cors = require('cors')
const router =  express.Router()
require('dotenv').config()
const bodyParser = require('body-parser')
const Blog = require('./models/blog')
const joi = require('joi')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const {verifyLogin} = require('./middleware/auth')
const upload = require('./middleware/upload')
const Likes = require('./models/likes')



app.use(cors())
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
const db = require('./config/db')
const dburl = process.env.DB_DEV_URL

app.get('/', (req, res) => {
    res.send('Hello from postman!')
})

app.get('/blog', async (req, res) => {
    const {name} = req.query
    console.log(name)
    const blogs = await Blog.find(name && name !=="" ?{
        $or: [
            { title: { $regex: name, $options: "i" } },
            { description: { $regex: name, $options: "i" } },
            { author: { $regex: name, $options: "i" } },
        ],
    }: {})
    res.send(blogs)

})


app.post('/blog/add',upload.single('image'), async (req, res) => {
    try{
        const { title, description, author, image, likes } = req.body;
        const imageLink = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;
        let exictingBlog = await Blog.findOne({ title });
        if(exictingBlog) return res.status(400).json({ msg: "Blog already exist" });
        const newBlog = new Blog({ title, description, likes ,author, image: imageLink });
        const savedBlog = await newBlog.save();
        if(!title) return res.status(400).json({ msg: "Title is required" });
      return  res.status(201).json({ msg: "Blog created with success", data: savedBlog });
    }catch(err){
        res.status(500).json({ msg: "can't create blog", err: err.message });
    }
})

app.post('/blog/add-like', async (req, res) => {
    try{
        const id = req.body.id;
        const blog = await Blog.findById(id);
        const userId = req.body.userId;
        if(!blog) return res.status(404).json({ msg: "Blog not found" });

        const like = await Likes.findOne({ user: userId, blog: blog._id });
        if(like) {
            await Likes.deleteOne({ user: userId, blog: blog._id });
        }
        const newLike = new Likes({ user: userId, blog: blog._id });
        const savedLike = await newLike.save();
        blog.likes = blog.likes + 1;
        await blog.save();

        res.status(200).json({ data: savedLike });
    }catch(err){
        res.status(500).json({ msg: "can't create blog", err: err.message });
    }
})
app.get('/blog/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const blog = await Blog.findById(id);
        if(!blog) return res.status(404).json({ msg: "Blog not found" });
       return res.status(200).json({ data: blog });
    }catch(err){
        res.status(500).json({ msg: "can't get blog", err: err.message });
    }
})

const registerSchema = joi.object({
    name: joi.string().required(),
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
})

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
})

app.post('/auth/register', async (req, res) => {
    try{
        const {name, username,email, password} = req.body;
        const {error, value} = registerSchema.validate({name, username, email, password});
        const iftheemailexiste = await User.findOne({email});
        if(iftheemailexiste){
            return res.status(400).json({ msg: "user already exist" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({name, username, email, password: hashedPassword});
            const saveUser = await newUser.save();
        if(error) return res.status(400).json({ msg: error.message });
        return res.status(201).json({ msg: "user created", data: saveUser });
       
    }catch(err){
       res.status(500).json({ msg: "can't create user", err: err.message }); 
    }
})

app.post('/auth/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        const {error, value} = loginSchema.validate({email, password});
        if(error) return res.status(400).json({ msg: error.message });
       

        const user = await User.findOne({email});
        if(!user){
             res.status(404).json({ msg: "user not found" });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ msg: "invalid credentials" });
        }

        // GENERATE Toten
        const token = JWT.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '15min'
        });

        await user.save();
        const {password:p, ...userWitheOuterPassword} = user._doc;
        res.status(200).json({ msg: "login success", data:userWitheOuterPassword });
    }catch(err){

        res.status(500).json({ msg: "can't login user", err: err.message });
    }
});

app.get('/auth/Profile',verifyLogin, async (req, res) => {
    try{
        const user = await User.findById(req.userId);
        console.log(req.userId)
        
        // if(!user){
        //     return res.status(404).json({ msg: "user not found" });
        // }
        const {password, ...userwitheNotpassword} = user._doc;
        res.status(200).json({msg: "user found", data: userwitheNotpassword}); 

    }catch(err){
        res.status(500).json({ msg: "can't get profile", err: err.message });
    }
})

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
    db.connect(dburl)
})