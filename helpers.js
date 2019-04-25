/**
 * getThread gets the entire thread given a Twit object and an id.
 * @param {Twit} T Twit object
 * @param {string} id Id to get thread
 */
export const getThread = async (T, id) => {
  try {
    const thread = [];
    await getThreadAux(T, id, thread);
    return thread;
  } catch (e) {
    throw e;
  }
};

const getThreadAux = async (T, id, thread) => {
  try {
    if (id) {
      const tweetdata = await getTweetById(T, id);
      thread.push(tweetdata);
      await getThreadAux(T, tweetdata.repliedid, thread);
    }
  } catch (e) {
    throw e;
  }
};

const getTweetById = async (T, id) => {
  try {
    const {
      data: {
        user,
        id_str,
        created_at,
        text,
        in_reply_to_status_id_str: repliedid
      }
    } = await T.get("statuses/show", { id });
    return {
      user: {
        id_str: user.id_str,
        name: user.name,
        screen_name: user.screen_name
      },
      id_str,
      created_at,
      text,
      repliedid
    };
  } catch (e) {
    throw e;
  }
};

export const buildDmPost = (id, message) => {
  return {
    event: {
      type: "message_create",
      message_create: {
        target: { recipient_id: id },
        message_data: { text: message }
      }
    }
  };
};

export const stringify = obj => {
  if (obj && typeof obj == "object") {
    return JSON.stringify(obj);
  }
  throw new TypeError("Input should be a object");
};

export const encodeToBase64 = input => Buffer.from(input).toString("base64");
export const normalizeDataToDcrtime = input => {
  if (input && typeof input == "string") {
    return [input];
  }
  throw new TypeError("Input should be a string");
};

const templates = [
  "Have you asked for me Sir? Anyway, this thread is stored with IPFS and should be timestamped within the next hour.",
  "I'm glad you called me :D Thread successfully added to IPFS and the timestamp is on its way.",
  "This thread is stored on IPFS and it will be timestamped within the next hour.",
  "Hello, your thread is timestamped. \nThanks for calling me!",
  "Hey there, here is your timestamped thread so you can always remember it!"
];

const getGreeting = () => Math.floor(Math.random() * 5);

export const replyTemplate = (digest, ipfsHash) => `${
  // choose greeting message randomly
  templates[getGreeting()]
} \n
Timestamping status: https://timestamp.decred.org/results?digests=${digest}&timestamp=false \n \n
Thread json: https://ipfs.io/ipfs/${ipfsHash}
`;

export const cleanTweetText = text => {
  if (!text || typeof text !== "string") {
    throw new TypeError("Input must be a valid string");
  }
  const undesiredTags = /^(@[a-zA-z_0-9]+[ ])*/.exec(text)[0];
  const cleanedText = undesiredTags ? text.replace(undesiredTags, "") : text;

  return cleanedText;
};

export const isRetweet = tweet => {
  const isRetweet = !!tweet.retweeted_status;
  return isRetweet;
};

export const isReplyToBotTweet = (tweet, tag) => {
  const { in_reply_to_screen_name, in_reply_to_status_id_str } = tweet;
  const isReplyToBot =
    in_reply_to_status_id_str && in_reply_to_screen_name === tag;
  return isReplyToBot;
};

export const validateTweet = (tweet, tag) => {
  if (!tweet || !tweet.text || typeof tweet.text !== "string") {
    throw new TypeError("Invalid tweet input");
  }

  if (isReplyToBotTweet(tweet, tag) || isRetweet(tweet)) {
    return false;
  }

  const { text } = tweet;
  const cleanedText = cleanTweetText(text);
  const botIsMentioned = cleanedText.toLowerCase().includes(tag);
  return botIsMentioned;
};
