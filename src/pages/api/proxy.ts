import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_HOSTS = ["pds-geosciences.wustl.edu", "trek.nasa.gov"];

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const targetUrl = (req.query.url as string)?.trim();

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing target URL" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return res.status(403).json({ error: "Host not allowed" });
  }

  try {
    const response = await axios.get(parsedUrl.toString(), {
      responseType: "text",
      transformResponse: [(data) => data],
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: "Proxy request failed" });
  }
};

export default handler;
