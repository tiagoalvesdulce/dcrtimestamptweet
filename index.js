import dotenv from "dotenv";
import Twit from "twit";
import dcrtime from "dcrtimejs";
import { getThread, stringify, encodeToBase64, normalizeDataToDcrtime } from "./helpers";

dotenv.config();

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);

const timestampThread = async ({ id }) => {
  try {
    console.log("getting thread");
    const timestampRes = await asyncPipe(
      getThread,
      stringify,
      encodeToBase64,
      normalizeDataToDcrtime,
      dcrtime.timestampFromBase64
    )({ T, id });
    console.log("got thread");
    return {
      threadDigest: timestampRes.digests[0],
      id
    };
  } catch (e) {
    return e;
  }
};

const replyWithDigest = async ({ id, threadDigest }) => {
  console.log("replying");
  try {
    const status = `SHA256: ${threadDigest.digest}\n\nSee more: https://timestamp.decred.org/results?digests=${threadDigest.digest}&timestamp=false`;
    await T.post("statuses/update", { status, in_reply_to_status_id: id, auto_populate_reply_metadata: "true" });
    console.log("replied tweet with dcrtime info");
  } catch (e) {
    return e;
  }
};

const dealWithTweet = id => {
  try {
    return asyncPipe(
      timestampThread,
      replyWithDigest
    )({ id });
  } catch (e) {
    return e;
  }
};

const stream = T.stream("statuses/filter", { track: "@dcrtimestampbot", retry: true });

console.log("streaming...");
stream.on("tweet", async (tweet) => {
  console.log("got one tweet");
  try {
    await dealWithTweet(tweet.id_str);
  } catch (e) {
    console.log("Oops, something failed", e);
  }
});

stream.on("error", (e) => {
  console.log("Something bad from Twitter", e);
});
