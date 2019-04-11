import dotenv from "dotenv";
import Twit from "twit";
import dcrtime from "dcrtimejs";
import {
  getThread,
  stringify,
  encodeToBase64,
  normalizeDataToDcrtime,
  replyTemplate
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

const processTweetThread = async ({ id }) => {
  try {
    logger.debug(`getting thread for tweet id ${id}`);
    const thread = await getThread({ T, id });
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
      id
    };
  } catch (e) {
    logger.error(`processTweetThreadError ${id}: ${e}`);
    return e;
  }
};

const replyResults = async ({ id, threadDigest, ipfsHash }) => {
  try {
    const status = replyTemplate(threadDigest.digest, ipfsHash);
    const res = await T.post("statuses/update", {
      status,
      in_reply_to_status_id: id,
      auto_populate_reply_metadata: "true"
    });
  } catch (e) {
    logger.error(e);
    return e;
  }
};

ipfs.on("ready", async () => {
  const { version } = await ipfs.version();
  logger.info(`IPFS Connected! Version: ${version}`);
  startStreaming();

  const tenSecondsInMs = 10000;
  setInterval(() => {
    ipfs.swarm.peers((err, peersInfo) => {
      if (err) {
        logger.error(err);
        return;
      }
      logger.debug(`IPFS connected to ${peersInfo.length} peers`);
    });
  }, tenSecondsInMs);
  // Keep this line for now so it can be used for testing purposes
  // dealWithTweet("1116024316339130369");
});

const dealWithTweet = id => {
  logger.info(`dealing with tweet ${id}`);
  try {
    return asyncPipe(processTweetThread, replyResults)({ id });
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
    try {
      await dealWithTweet(tweet.id_str);
    } catch (e) {
      logger.error("dealWithTweet error:", e);
    }
  });

  stream.on("error", e => {
    logger.error(e);
  });
};
