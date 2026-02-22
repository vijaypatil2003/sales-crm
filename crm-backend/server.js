import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/configs/db.config.js";

dotenv.config();

await connectDB();

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
