const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Game = require("./mode/game");
const User = require("./mode/user");
const Purchase = require("./mode/purchase");
const WebSocket = require("ws");

app.use(cors());
app.use(express.json());

const random = (min, max) => {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
};
let dataChanged = true;
const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    console.log("Received message:", message.toString("utf8"));
    wss.clients.forEach(async function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        const data = await getPurchaseAmounts();
        client.send(JSON.stringify(data));
      }
    });
  });

  setInterval(async () => {
    if (dataChanged) {
      wss.clients.forEach(async function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          const data = await getPurchaseAmounts();
          client.send(JSON.stringify(data));
        }
      });
      dataChanged = false;
    }
  }, 500);
});

const getApiData = async () => {
  console.log("getApi");
  const options = {
    method: "GET",
    url: "https://free-to-play-games-database.p.rapidapi.com/api/games",
    headers: {
      "X-RapidAPI-Key": "96902ee1d2msh3e472de85405f0bp15687ajsn2195466e9a06",
      "X-RapidAPI-Host": "free-to-play-games-database.p.rapidapi.com",
    },
  };

  const res = await axios.request(options);
  const arr = Object.values(res)[5];

  arr.forEach((tmp) => {
    let rate = random(2, 5);
    let price = random(5, 100);
    console.log(tmp);
    let game = new Game({
      id: tmp.id,
      title: tmp.title,
      thumbnail: tmp.thumbnail,
      short_description: tmp.short_description,
      genre: tmp.genre,
      platform: tmp.platform,
      publisher: tmp.publisher,
      developer: tmp.developer,
      release_date: tmp.release_date,
      rating: rate,
      price: price,
      video: "",
    });
    game.save();
  });
};

//****************************MONGOOS********************************* */
const uri =
  "mongodb+srv://guyroey:X3PErZ1DUnqfGWee@cluster0.xcovqzy.mongodb.net/?retryWrites=true&w=majority";
mongoose.set("strictQuery", true);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log("connected"))
  .catch((err) => console.log(err));

const addGame = async (game) => {
  const gameSchema = new Game(game);
  const ret = await gameSchema.save();
  return ret;
};

const getGames = async (search) => {
  const games = await Game.find(search).limit(50);
  return games;
};

const getGameByName = async (search) => {
  const games = await Game.find(search);
  return games;
};

const updateGame = async (game) => {
  const gameId = game.game;
  const update = game.update;
  const doc = await Game.findOneAndUpdate(gameId, update);
  return doc;
};

const addUser = async (user) => {
  const userSchema = new User(user);
  const ret = await userSchema.save();
  return ret;
};

const getUser = async (user) => {
  const ret = await User.findOne(user);
  return ret;
};

const getAllUsers = async () => {
  return User.find({});
};

const updateUser = async (user) => {
  const email = user.user;
  const update = user.update;
  const doc = await User.findOneAndUpdate(email, update);
  return doc;
};
const getCarouselGames = async () => {
  const games = await Game.find({ rating: 5 }).limit(10);
  return games;
};

const groupBy = async (data) => {
  console.log(data);
  const pipeline = [
    data,
    {
      $group: {
        _id: { genre: "$genre", platform: "$platform", rating: "$rating" },
        games: {
          $push: "$$ROOT",
        },
      },
    },
  ];

  const results = await Game.aggregate(pipeline);
  return results;
};

const addPurchase = async (purchase) => {
  const purchaseSchema = new Purchase(purchase);
  const ret = await purchaseSchema.save();
  dataChanged = true;
  return ret;
};

const getPurchaseAmounts = async () => {
  try {
    const stats = await Purchase.aggregate([
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: "Invalid month",
            },
          },
          year: "$_id.year",
          total: "$total",
        },
      },
    ]).exec();
    return stats;
  } catch (error) {
    console.error(error);
  }
};

const deleteGame = (gameName) => {
  const game = Game.deleteOne(gameName);
  return game;
};
//****************************HTTP********************************* */
/***********POST*************/

//body is a json, empty for non filter
app.post("/getGames", async (req, res) => {
  const games = await getGames(req.body);
  res.send(games);
});

app.post("/gameName", async (req, res) => {
  const games = await getGameByName(req.body);
  res.send(games);
});

//body is a json of a game, add all game params to json
app.post("/addGame", async (req, res) => {
  const game = await addGame(req.body);

  res.send(game);
});

//body is a json {game:{id:gameId}, update:{fieldName:update value}}
app.post("/updateGame", async (req, res) => {
  const ret = await updateGame(req.body);
  res.send(ret);
});
//body is a json of a user, add all user params to json
app.post("/addUser", async (req, res) => {
  console.log("add user");
  const ret = await addUser(req.body);
  console.log(ret);
  res.send(ret);
});

app.post("/getUser", async (req, res) => {
  const ret = await getUser(req.body);
  res.send(ret);
});

app.post("/getAllUsers", async (req, res) => {
  const ret = await getAllUsers(req.body);
  res.send(ret);
});

//body is a json {user:{_id:gameId}, update:{fieldName:update value}}
app.post("/updateUser", async (req, res) => {
  const ret = await updateUser(req.body);
  res.send(ret);
});

app.post("/Carousel", async (req, res) => {
  const ret = await getCarouselGames();
  res.send(ret);
});

app.post("/groupBy", async (req, res) => {
  const ret = await groupBy(req.body);
  res.send(ret);
});

app.post("/addPurchase", async (req, res) => {
  const ret = await addPurchase(req.body);
  res.send(ret);
});

app.post("/getPurchaseAmounts", async (req, res) => {
  const ret = await getPurchaseAmounts();
  res.send(ret);
});

app.post("/deleteGame", async (req, res) => {
  const ret = await deleteGame(req.body);
  res.send(ret);
});
/***********GET*************/

app.get("/fetch", async (req, res) => {
  console.log("fetch");
  // getApiData();
  res.send("hi");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
