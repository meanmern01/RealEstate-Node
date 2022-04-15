const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
dotenv.config();
const fs = require("fs");
const https = require("https");

const app = express();

app.use(bodyParser.json({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.get("/", (req, res) => {
    res.send("WELCOME");
});

const users = require("./routes/userRoutes");
const inventory = require("./routes/InventoryRoutes");
const cart = require("./routes/cartRoutes");
const payment = require("./routes/PaymentRoutes");

app.use("/api/auth", users);
app.use("/api/inventory", inventory);
app.use("/api/cart", cart);
app.use("/api/payment", payment);
// app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/emailImages", express.static(path.join(__dirname, "/emailImages")));

Certificate;
const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/hemlyco.com/privkey.pem",
    "utf8"
);
const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/hemlyco.com/cert.pem",
    "utf8"
);
const ca = fs.readFileSync(
    "/etc/letsencrypt/live/hemlyco.com/chain.pem",
    "utf8"
);

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
};

let server = null;
if (process.env.NODE_ENV === "development") {
    console.log("This is the development environment");
    server = http.createServer(app);
} else {
    console.log("This is the production environment");
    // server = http.createServer(app);
    server = https.createServer(credentials, app);
}
const PORT = process.env.PORT;
CONNECTION_URL = process.env.CONNECTION_URL;

mongoose
    .connect(CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => {
        server.listen(PORT, async () => {
            console.log(`DB connnected and Server running on Port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("ConnectionError...", error);
    });

mongoose.set("useFindAndModify", false);
