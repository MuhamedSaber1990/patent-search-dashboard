import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { config } from "dotenv";

const app = express();
config();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const port = process.env.PORT;
const API_URL = "https://ops.epo.org/3.2";
const configer = {
  auth: {
    username: clientId,
    password: clientSecret,
  },
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};
let authToken;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/toauth", (req, res) => {
  res.render("auth.ejs");
});

app.post("/auth", async (req, res) => {
  try {
    const token = await axios.post(
      API_URL + "/auth/accesstoken",
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        auth: { username: req.body.key, password: req.body.secretKey },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    authToken = token.data.access_token;
    console.log(authToken);
    res.render("index.ejs");
  } catch (error) {
    console.error(
      "Error getting token:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to authenticate");
  }
});
app.get("/results", async (req, res) => {
  if (!authToken) {
    return res.status(401).send("Not authenticated. Go to /toauth first.");
  }

  const { inputList, inputText } = req.query;
  const feildMap = {
    keyword: "ti",
    inventor: "in",
    applicant: "pa",
    country: "pncc",
    ipc: "ipc",
    year: "ap",
  };

  const field = feildMap[inputList];

  if (!field || !inputText) {
    return res.status(400).send("Invalid search input.");
  }

  const query = `${field}="${inputText}"`;

  try {
    const PatentResponse = await axios.get(
      API_URL + "/rest-services/published-data/search/biblio",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Range: "1-5",
        },
        params: {
          q: query,
        },
      }
    );
    console.log(PatentResponse.data);
    res.json(PatentResponse.data);
  } catch (error) {
    console.error(
      "Error getting token:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to authenticate");
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
