const queueConfig = {
  redis: process.env.REDIS_URL || "",
  prefix: "dangila:queue:",
};

export default queueConfig;
