// Local 테스트용 서버
// import mongoose from "mongoose";

// mongoose.connect(process.env.DB_URL);

// const db = mongoose.connection;

// const handleOpen = () => console.log("✅ Connected to DB ");
// const handleError = (error) => console.log("❌ DB Error", error);

// db.on("error", handleError); //에러출력
// db.once("open", handleOpen); //오픈시 한번만 실행

//Render 배포용 서버 Redis
import { createClient } from "redis";

(async () => {
  // Connect to your internal Redis instance using the REDIS_URL environment variable
  // The REDIS_URL is set to the internal Redis URL e.g. redis://red-343245ndffg023:6379
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  // Send and retrieve some values
  await client.set("key", "node redis");
  const value = await client.get("key");

  console.log("found value: ", value);
})();
