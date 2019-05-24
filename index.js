import dotenv from "dotenv";
import Twit from "twit";
import dcrtime from "dcrtimejs";
import {
  getThread,
  stringify,
  encodeToBase64,
  normalizeDataToDcrtime,
  replyTemplate,
  buildDmPost,
  validateTweet
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
    throw new Error(
      `processTweetThread error tweetID: ${tweetId}, error: ${e}`
    );
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
    throw new Error(`replyResults error tweetID: ${tweetId} `);
  }
};

const dmResult = async ({ userId, status }) => {
  try {
    const params = buildDmPost(userId, status);
    await T.post("direct_messages/events/new", params);
    logger.info(`DM sent to user: ${userId}`);
  } catch (e) {
    throw new Error(`dmResult error userId: ${userId} `);
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
});

const dealWithTweet = async ({ userId, tweetId }) => {
  if (!userId || !tweetId) {
    logger.error("dealWithTweet: invalid input");
    return;
  }
  logger.info(`dealing with tweet ${tweetId} from user ${userId}`);
  try {
    await asyncPipe(processTweetThread, replyResults, dmResult)({
      userId,
      tweetId
    });
  } catch (e) {
    logger.error("dealWithTweet error:", e);
  }
};

const startStreaming = () => {
  let stream = T.stream("statuses/filter", {
    track: process.env.TRACKED_WORD,
    retry: true
  });

  logger.info("Waiting for tweets to show up...");

  stream.on("tweet", tweet => {
    if (!validateTweet(tweet, process.env.TRACKED_WORD)) {
      return;
    }
    dealWithTweet({ userId: tweet.user.id_str, tweetId: tweet.id_str });
  });

  stream.on("error", e => {
    logger.error(`stream error: ${e}`);
  });

  stream.on("connected", () => {
    logger.info("Twitter stream connected!");
  });

  stream.on("disconnect", disconnectMessage => {
    logger.error(`stream disconnected: ${disconnectMessage}`);
    stream.start();
  });
};
