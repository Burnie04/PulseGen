# PulseGen

PulseGen is a modern video streaming and management platform. It allows users to securely sign up, upload video content, and manage media files through a responsive interface.

The project is built as a Monorepo with a **React (Vite)** frontend and a **Node.js/Express** backend using **MongoDB**.

## 🚀 Tech Stack

### Frontend
* **Framework:** React 18 (via Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI / Radix UI
* **State Management:** React Context API
* **Routing:** React Router DOM

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt
* **File Handling:** Multer (or similar stream handling)

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
* Git

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/pulsegen.git](https://github.com/yourusername/pulsegen.git)
cd pulsegen
2. Backend SetupNavigate to the backend folder (create one if you haven't separated it yet, or use root if mixed).Bash# Example: If backend code is in a 'server' or root folder
cd backend 
npm install
Create a .env file in the backend folder:Code snippetPORT=5000
MONGO_URI=mongodb://localhost:27017/pulsegen  # Or your MongoDB Atlas connection string
JWT_SECRET=your_super_secret_jwt_key
Start the backend server:Bashnpm start
# or for development
npm run dev
The server should run on http://localhost:50003. Frontend SetupOpen a new terminal and navigate to the Frontend folder.Bashcd Frontend
npm install
Check your vite.config.ts to ensure the proxy is set correctly to your backend port:TypeScript// vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
      secure: false,
    },
  },
}

Start the frontend development server:Bashnpm run dev
The frontend should run on http://localhost:8080 (or similar)

📂 Project StructurePlaintextPulseGen/
├── Frontend/           # React Application
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── context/    # AuthContext & Global State
│   │   ├── hooks/      # Custom Hooks (useAuth)
│   │   └── pages/      # Route Pages
│   ├── vite.config.ts
│   └── package.json
│
├── backend/            # Express Application (or root)
│   ├── models/         # Mongoose Schemas (User, Video)
│   ├── routes/         # API Endpoints (auth.js, video.js)
│   ├── server.js       # Entry point
│   └── .env            # Backend secrets
└── README.md

🔌 API EndpointsAuthentication (/api/auth)MethodEndpointDescriptionBodyPOST/signupRegister a new user{ email, password, displayName }
POST/loginAuthenticate user{ email, password }
GET/meGet current user profileRequires Bearer TokenVideos (/api/videos)MethodEndpointDescriptionBody
POST/uploadUpload a video fileFormData (file, title)GET/List all videos-

🐞 Troubleshooting"Failed to load module script... MIME type"Ensure you are accessing the site via http://localhost:8080 and not opening index.html directly.
If deploying, ensure your build command is npm run build and publish directory is dist."404 Not Found" on LoginEnsure the Backend server is running.Check that vite.config.ts has the correct proxy pointing to the Backend port (usually 5000).📝

License: This project is licensed under the MIT License.
