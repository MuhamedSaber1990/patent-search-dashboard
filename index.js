import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { config } from "dotenv";

const app = express();
config();

// Load credentials
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const port = process.env.PORT || 3000;
const API_URL = "https://ops.epo.org/3.2";

// Auth config
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

// EJS setup
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home page
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Authenticate route
app.get("/auth", async (req, res) => {
  try {
    const token = await axios.post(
      API_URL + "/auth/accesstoken",
      new URLSearchParams({ grant_type: "client_credentials" }),
      configer
    );

    authToken = token.data.access_token;
    console.log("✅ Access Token:", authToken);

    res.render("index.ejs");
  } catch (error) {
    console.error(
      "❌ Error getting token:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to authenticate");
  }
});

app.get("/results", async (req, res) => {
  if (!authToken) {
    return res.status(401).send("Not authenticated. Go to /auth first.");
  }

  const { inputList, inputText, page = 1 } = req.query; // default page = 1
  const resultsPerPage = 10;

  // Calculate range (EPO API expects "start-end" format, e.g. "1-10", "11-20")
  const start = (page - 1) * resultsPerPage + 1;
  const end = page * resultsPerPage;
  const resultsRange = `${start}-${end}`;

  const fieldMap = {
    keyword: "ti",
    inventor: "in",
    applicant: "pa",
    ipc: "ipc",
  };

  const field = fieldMap[inputList];
  if (!field || !inputText) {
    return res.status(400).send("Invalid search input.");
  }

  const query = `${field}="${inputText}"`;

  try {
    const PatentResponse = await axios.get(
      API_URL + "/rest-services/published-data/search/biblio",
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { q: query, Range: resultsRange },
      }
    );

    console.log(`✅ Page ${page} (${resultsRange}) received.`);

    const docs =
      PatentResponse.data?.["ops:world-patent-data"]?.["ops:biblio-search"]?.[
        "ops:search-result"
      ]?.["exchange-documents"] || [];

    // Map patents (only if docs is an array)
    const patents = Array.isArray(docs)
      ? docs.map((doc) => {
          const ex = doc["exchange-document"];

          // --- Title ---
          const titles = ex["bibliographic-data"]["invention-title"];
          let title = "No Title";
          if (Array.isArray(titles)) {
            const enTitle = titles.find((t) => t["@lang"] === "en");
            title = enTitle ? enTitle["$"] : titles[0]["$"];
          } else if (titles) {
            title = titles["$"];
          }

          // --- Abstract ---
          const abstracts = ex["abstract"];
          let abstract = "No Abstract";
          if (Array.isArray(abstracts)) {
            const enAbs = abstracts.find((a) => a["@lang"] === "en");
            abstract = enAbs ? enAbs.p["$"] : abstracts[0].p["$"];
          } else if (abstracts) {
            abstract = abstracts.p?.["$"];
          }

          // --- Applicants ---
          let applicants = [];
          const applicantData =
            ex["bibliographic-data"]["parties"]?.applicants?.applicant;
          if (Array.isArray(applicantData)) {
            applicants = applicantData.map(
              (a) => a["applicant-name"]?.name?.["$"] || "Unknown"
            );
          } else if (applicantData) {
            applicants = [
              applicantData["applicant-name"]?.name?.["$"] || "Unknown",
            ];
          }

          // --- Inventors ---
          let inventors = [];
          const inventorData =
            ex["bibliographic-data"]["parties"]?.inventors?.inventor;
          if (Array.isArray(inventorData)) {
            inventors = inventorData.map(
              (i) => i["inventor-name"]?.name?.["$"] || "Unknown"
            );
          } else if (inventorData) {
            inventors = [
              inventorData["inventor-name"]?.name?.["$"] || "Unknown",
            ];
          }

          return {
            docNumber: ex["@doc-number"],
            country: ex["@country"],
            kind: ex["@kind"],
            title,
            abstract,
            applicants,
            inventors,
          };
        })
      : [];

    // Pass page number to EJS so we can show next/prev links
    res.render("results.ejs", {
      patents,
      page: Number(page),
      inputList,
      inputText,
    });
    // res.json(PatentResponse.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).send("Error fetching or parsing patent data");
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 App listening on port ${port}`);
});
