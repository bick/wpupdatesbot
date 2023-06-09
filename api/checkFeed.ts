import Twit from "twit";
import Parser from "rss-parser";

// Initialize Twitter API client
const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY || "",
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET || "",
  access_token: process.env.TWITTER_ACCESS_TOKEN || "",
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

// Initialize RSS Parser
const parser = new Parser();

// List of RSS Feeds
const feedList: string[] = [
  "https://wordpress.org/news/category/releases/feed/",
];

// Function to tweet
function tweet(status: string) {
  T.post("statuses/update", { status }, function (err, data, response) {
    if (err) {
      console.error(err);
    } else {
      console.log(`Tweeted: ${status}`);
    }
  });
}

// Function to check feeds
async function checkFeeds() {
  for (const feed of feedList) {
    const feedData = await parser.parseURL(feed);
    for (const item of feedData.items) {
      if (isNew(item)) {
        tweet(item.title + " " + item.link);
      }
    }
  }
}

function isNew(item: { [key: string]: any } & Parser.Item): boolean {
  // Check if 'pubDate' field is within the last hour
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  if (item.pubDate) {
    const pubDate = new Date(item.pubDate).getTime();
    return pubDate > oneHourAgo;
  } else {
    return false;
  }
}

// Serverless function
export default async function (res: {
  status: (arg0: number) => {
    (): any;
    new (): any;
    send: { (arg0: string): void; new (): any };
  };
}) {
  await checkFeeds();
  res.status(200).send("Done");
}
