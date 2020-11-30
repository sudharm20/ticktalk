//Entry point to everything
const path = require('path')
const express  = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userLeave,
  getRoomUsers} = require('./utils/users')


const app = express();
const server = http.createServer(app)
const io = socketio( server)
const botname = 'TickTalk admin'

//set static folder
app.use(express.static(path.join(__dirname,'public')));


//run when a client connects

io.on('connection',socket => {


  
socket.on('joinRoom',({username,room})=>{


  const user = userJoin(socket.id,username,room)

  socket.join(user.room)
  
  socket.emit('message',formatMessage(botname,'Welcome to Ticktalk'))

  //broadcast when user user connects accept connection
  socket.broadcast.to(user.room).emit('message',formatMessage(botname,`${user.username} joined`))

  //send user

  io.to(user.room).emit('roomUsers',{
    room:user.room,
    users:getRoomUsers(user.room)
  })

})



  console.log("new socket connection..")
     

    //when client disconnects 
  socket.on('disconnect',()=>{
    const user = userLeave(socket.id)
     if(user){
      io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`))

      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
      })
     }
    })


  //listen for Chat message
  socket.on('ChatMessage', (msg)=>{

    const user = getCurrentUser(socket.id)
    console.log(user)
      //console.log(msg);
      io.to(user.room).emit('message',formatMessage(user.username,msg))
  })



})


var  PORT = 3000 || process.env.PORT   //looks for environment variable port and use that instead of 3000
server.listen(PORT,()=> console.log(`Server Running on port ${PORT}`));
