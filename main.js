import mongoose, { setDriver } from "mongoose";
import express from "express"
import dotenv from "dotenv"

dotenv.config({path:'./config.env'})

console.log(process.env.DB_PASSWORD)

const server = express()
const dburl = process.env.DB_URL.replace('<db_password>',process.env.DB_PASSWORD)
const db = mongoose.connect(dburl)
.then(val=>{console.log(`DATABASE Connection: Sucessful;`)})
.catch(err=>{console.log(err)})


const userSchema = new mongoose.Schema({
    username: {
        type:String,
        unique:true,
        required:true,
        minLength: [5,'NAME IS SHORTER THAN 5 LETTERS!!!']
    },
    password:{
        type:String,
        required:true,
        minLength: [5,'PASSWORD IS SHORTER THAN 5 LETTERS!!!']
    },
    tasks:[{title:String,priority:String}]
})
const user = mongoose.model('AppUsers',userSchema)



//------------------- Routes -----------------------

function addTask(data,res){
    if (data){
        user.findOne({username:data.username}).then(user => {
            user.tasks.push({title:data.title,priority:data.priority})
            user.save()
        }).catch(err=>{console.log(err)})
    } else {
        res.json({status:'failed',message:'no task was added'})
    }
}

function registerNewUser(data){
    user.create({username:data.username,password:data.password}).then(val=>{console.log(val)})
    console.log('User Created Secessfully')
}
function verifyLogin(data,res){
    user.findOne({username:data.username}).then(val=>{
        if (val){
            if (val.username === data.username && val.password === data.password){
                const ob = {status:'sucess',data:val}
                res.json(ob)
            } else {
                res.json({status:'failed',data:"username or password error"})
            }
        } else {
            res.json({status:'failed',data:"username or password error"})
            console.log('NONE WAS FOUND')
        }
    })
}

function getUserData(data,res){
    console.log(data)
    user.findOne({username:data})
    .then(val => {
        if (val){
            console.log(`getUserData: USER FOUND --${val.username}--`)
            const ob = {status:'USER FOUND',data: val}
            console.log(ob)
            res.json(ob)
        } else {
             console.log(`getUserData: NO USER WAS FOUND --${val}--`)
        }
        
    }).catch(err => {
        console.log('Error occured in getuserdata')
        console.log(err)
    })
}




server.use(express.static('./files'))
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.get('/register',(req,res)=>{
    res.sendFile('C:/Users/m1/Desktop/Project_Eliguis/files/register.html')
})
server.post('/register',(req,res)=>{
    console.log(req.body)
    registerNewUser(req.body)
})

server.get('/login',(req,res)=>{
    res.sendFile('C:/Users/m1/Desktop/Project_Eliguis/files/login.html')
})
server.post('/login',(req,res)=>{
    console.log(req.body)
    verifyLogin(req.body,res)
})

server.post('/tasks',(req,res)=>{
    const task = req.body
    console.log(task)
        addTask(task)
})

server.get('/users/tasks/:id',(req,res)=>{
    const data = req.params.id
    getUserData(data,res)
})





server.listen(process.env.PORT,'192.168.100.185',(error)=>{
    if (error){
        console.log(error)
    } else {
        console.log(`Server Running On Port: ${process.env.PORT}`)
    }
})