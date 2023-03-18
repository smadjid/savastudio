require("dotenv").config();
const session = require("express-session");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const MongoDBStore = require("connect-mongodb-session")(session); // add this package to store the user session id automatically on mongodb
// check on your db, you will have another collection (next to people) which is 'mySessions'
const loginRouter = require("./routes/loginRoutes");
const sessionsRouter = require("./routes/sessionRoutes");
const runRouter = require("./routes/runRoutes");
const helpRouter = require("./routes/helpRoutes");
const courseRouter = require("./routes/courseRoutes");
const troublesRouter = require("./routes/troubleRoutes");

const app = express();
const MAX_AGE = 1000 * 60 * 60 * 2; // 2hrs
const port = process.env.PORT || 3080;

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useNewUrlParser: true,
});
const mongoDBstore = new MongoDBStore({
  uri: process.env.DATABASE_CONNECTION_STRING,
  collection: process.env.DATABASE_SESSION_COLLECTION,
});

app.use(
  session({
    secret: "a1s2d3f4g5h6",
    name: "session-id",
    store: mongoDBstore,
    cookie: {
      maxAge: MAX_AGE,
      sameSite: false,
      secure: false,
    },
    resave: true,
    saveUninitialized: false,
  })
);

app.use(cors(corsOptions));
app.use(express.json());

// ROUTERS
app.use("/api", loginRouter);
app.use("/api", sessionsRouter);
app.use("/api", runRouter);
app.use("/api", helpRouter);
app.use("/api", courseRouter);
app.use("/api", troublesRouter);

// START SERVER
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
app.set("socketio", io);

io.on("connection", (socket) => {
  //console.log("connected to socket.io");

  socket.on("join", (run) => {
    // if(socket.rooms && socket.rooms.indexOf(run) >= 0)
    //console.log("joining event");
    socket.join(run);
  });

  socket.on("updated", (run) => {
    //console.log("update on:", run);
    if (!socket.rooms.has(run) >= 0) socket.join(run);
    // io.to(run).emit("do_update");
    io.emit('do_update');
  });

  // io.of("/").adapter.on("create-room", (room) => {
  //   console.log(`room ${room} was created`);
  // });

  // io.of("/").adapter.on("join-room", (room, id) => {
  //   console.log(`socket ${id} has joined room ${room}`);
  //   console.log(socket.rooms);
  // });

  // socket.off("setup", () => {
  //   console.log("USER DISCONNECTED");
  //   socket.leave(userData._id);
  // });
});

module.exports = app;
