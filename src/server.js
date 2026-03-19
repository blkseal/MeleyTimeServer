require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log("API running on port " + PORT);
    });
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}

start();
