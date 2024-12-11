import express from "express";

const app = express();
app.use(express.json()); // parse json request body

const port = 419;
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@email.com",
    age: 25,
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane@email.com",
    age: 30,
  },
  {
    id: 3,
    name: "Jorja Smith",
    email: "jorja@email.com",
    age: 35,
  },
];

app.get("/", (req, res) => {
  res.send("hello welcome to my personal api server");
});

// getting all users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

//getting a single user by id
app.get("/users/:id", (req, res) => {
  const { id } = req.params; // get id from request params
  const user = users.find((user) => user.id === Number(id)); // find user by id and convert id to number
  if (user) {
    res.status(200).json(user); // send user as response
  } else {
    res.status(404).json({ message: "user not found" }); // send error message if user not found
  }
});

app.post("/users", (req, res) => {
  let user = req.body; // get user from request body
  if (user) {
    user = { id: users.length + 1, ...user }; // add id to user
    users.push(user); // add user to users array
    res.status(201).json({ message: "user created successfully", user });
    console.log(users); // send success response
  } else if (!user) {
    res.status(400).json({ message: "user not found" }); // send error message if user not found
  }
});

// update user by id
app.put("/users/:id", (req, res) => {
  const { id } = req.params; // get id from request params
  const { name, email, age } = req.body; // get updated user data from request body
  if (!id) {
    res.status(400).json({ message: "id is required" }); // send error message if id is missing
  } else if (!name || !email || !age) {
    res.status(400).json({ message: "all fields are required" }); // send error message if any field is missing
  }
  const user = users.findIndex((user) => user.id === parseInt(id)); // find user index by id
  users[user] = { id: parseInt(id), name, email, age }; // update users array data from request body
  res
    .status(200)
    .json({ message: "user updated successfully", user: users[user] }); // send success response
});

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
