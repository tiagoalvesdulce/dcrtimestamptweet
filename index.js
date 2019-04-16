import dotenv from "dotenv";
import Twit from "twit";
import dcrtime from "dcrtimejs";
import {
  getThread,
  stringify,
  encodeToBase64,
  normalizeDataToDcrtime,
  replyTemplate,
  buildDmPost
} from "./helpers";
import { ipfs, addThreadToIPFS } from "./services/ipfs";
import logger from "./log";

dotenv.config();

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const asyncPipe = (...fns) => x => fns.reduce(async (y, f) => f(await y), x);

const processTweetThread = async ({ tweetId, userId }) => {
  try {
    logger.debug(`getting thread for tweet id ${tweetId}`);
    const thread = await getThread(T, tweetId);
    const { digests } = await asyncPipe(
      stringify,
      encodeToBase64,
      normalizeDataToDcrtime,
      dcrtime.timestampFromBase64
    )(thread);

    const digest = digests[0].digest;

    const { hash: ipfsHash } = await asyncPipe(
      stringify,
      addThreadToIPFS(digest)
    )(thread);

    logger.info(
      `Thread added! Ipfs hash: ${ipfsHash} / Thread digest: ${digest}`
    );
    return {
      threadDigest: digests[0],
      ipfsHash,
      tweetId,
      userId
    };
  } catch (e) {
    logger.error(`processTweetThreadError ${tweetId}: ${e}`);
    return e;
  }
};

const replyResults = async ({ userId, tweetId, threadDigest, ipfsHash }) => {
  try {
    const status = replyTemplate(threadDigest.digest, ipfsHash);
    await T.post("statuses/update", {
      status,
      in_reply_to_status_id: tweetId,
      auto_populate_reply_metadata: "true"
    });
    return {
      status,
      userId
    };
  } catch (e) {
    logger.error(e);
    return e;
  }
};

const dmResult = async ({ userId, status }) => {
  try {
    const params = buildDmPost(userId, status);
    await T.post("direct_messages/events/new", params);
    logger.info(`DM sent to user: ${userId}`);
  } catch (e) {
    logger.error(e);
    return e;
  }
};

ipfs.on("ready", async () => {
  const IPFS_INTERVAL = 10000;
  const { version } = await ipfs.version();
  logger.info(`IPFS Connected! Version: ${version}`);
  startStreaming();

  setInterval(() => {
    ipfs.swarm.peers((err, peersInfo) => {
      if (err) {
        logger.error(err);
        return;
      }
      logger.debug(`IPFS connected to ${peersInfo.length} peers`);
    });
  }, IPFS_INTERVAL);
  // Keep this line for now so it can be used for testing purposes
  // dealWithTweet("1116024316339130369");
});

const dealWithTweet = ({ userId, tweetId }) => {
  logger.info(`dealing with tweet ${tweetId}`);
  try {
    return asyncPipe(processTweetThread, replyResults, dmResult)({
      userId,
      tweetId
    });
  } catch (e) {
    return e;
  }
};

const startStreaming = () => {
  const stream = T.stream("statuses/filter", {
    track: process.env.TRACKED_WORD,
    retry: true
  });
  logger.info("Waiting for tweets to show up...");
  stream.on("tweet", async tweet => {
    const { retweeted_status } = tweet;
    if (retweeted_status) {
      return;
    }
    try {
      await dealWithTweet({ userId: tweet.user.id_str, tweetId: tweet.id_str });
    } catch (e) {
      logger.error("dealWithTweet error:", e);
    }
  });

  stream.on("error", e => {
    logger.error(e);
  });
};
