import { Response } from "express";

export const streamToResponse = async (
  res: Response,
  streamGenerator: AsyncGenerator<string, void, unknown>
) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("X-Content-Type-Options", "nosniff");

  for await (const chunk of streamGenerator) {
    res.write(chunk);
  }
  res.end();
};

export const createTextStream = async function* (
  text: string,
  delay = 20
): AsyncGenerator<string, void, unknown> {
  const words = text.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};
