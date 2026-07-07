import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function main() {
  await redis.set("hello", "LegalSaathi");
  const value = await redis.get("hello");

  console.log(value);
}

main();