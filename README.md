# 📘 Patent Search Dashboard  

A simple Node.js + Express web application that allows users to search patents from the **European Patent Office (EPO) OPS API** by keyword, inventor, applicant, or IPC classification.  

The app uses **EJS templates** for rendering, supports pagination, and displays patent metadata such as **title, abstract, applicants, inventors, and document numbers**.  

---

## 🚀 Features  

- 🔑 **Authentication** with the EPO OPS API using client credentials.  
- 🔍 **Patent Search** by:
  - Keyword (title)  
  - Inventor  
  - Applicant  
  - IPC Code  
- 📄 **Patent Details**: shows title, abstract, applicants, inventors, and document metadata.  
- ⏩ **Pagination**: browse results in pages of 10.  
- 🎨 **Simple UI** built with HTML, CSS, and EJS templates.  

---

## 📂 Project Structure  

```
.
├── public/              # Static assets (CSS, images, etc.)
├── views/               # EJS templates
│   ├── index.ejs        # Search form
│   └── results.ejs      # Search results with pagination
├── .env                 # Environment variables (CLIENT_ID, CLIENT_SECRET)
├── index.js            # Main Express app
└── package.json
```

---

## ⚙️ Setup & Installation  

### 1. Clone the repository  
```bash
git clone https://github.com/MuhamedSaber1990/patent-search-dashboard
cd patent-search-dashboard
```

### 2. Install dependencies  
```bash
npm install
```

### 3. Create `.env` file  
```ini
CLIENT_ID=your-epo-client-id
CLIENT_SECRET=your-epo-client-secret
PORT=3000
```

> You can register for OPS API credentials at the [EPO Developer Portal](https://developers.epo.org/).  

### 4. Run the application  
```bash
npm start
```

App will be available at:  
👉 `http://localhost:3000`

---

## 🔑 Usage  

1. **Authenticate**:  
   - Visit `http://localhost:3000/auth`  
   - The server fetches an access token from EPO OPS.  

2. **Search for patents**:  
   - Go to the home page (`/`)  
   - Choose search type (keyword, inventor, applicant, IPC code).  
   - Enter a search term (e.g., `AI`, `Google`, `John Smith`).  
   - View results with title, abstract, applicants, and inventors.  

3. **Navigate results**:  
   - Use `⬅ Prev` / `Next ➡` buttons to browse through results.  
   - Start a new search anytime.  

---

## 🛠️ Tech Stack  

- **Node.js + Express** – backend & routing  
- **Axios** – HTTP requests to the OPS API  
- **EJS** – templating engine  
- **dotenv** – environment variables  
- **HTML/CSS** – frontend  

---

## 📌 Example  

**Search Form (index.ejs):**  
- Choose search type  
- Enter text (e.g., `"Artificial Intelligence"`)  
- Click **Search**  

**Results Page (results.ejs):**  
- Displays:  
  - Patent title  
  - Document ID (Country + Number + Kind)  
  - Abstract  
  - Applicants  
  - Inventors  
- Pagination + new search button  

---

## ⚠️ Notes  

- Authentication must be refreshed before token expires (default lifetime ~20 minutes).  
- EPO OPS API has request limits depending on your plan.  
- Some patents may not have English abstracts/titles available.  

---

## 📜 License  

MIT License © 2025  
