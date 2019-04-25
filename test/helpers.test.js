import { describe, Try } from "riteway";
import {
  stringify,
  encodeToBase64,
  normalizeDataToDcrtime,
  cleanTweetText,
  validateTweet
} from "../helpers";

describe("stringify", async assert => {
  assert({
    given: "no arguments",
    should: "throw",
    actual: Try(stringify),
    expected: new TypeError()
  });
  assert({
    given: "null",
    should: "throw",
    actual: Try(stringify, null),
    expected: new TypeError()
  });
  assert({
    given: "obj",
    should: "return stringified obj",
    actual: stringify({ test: 1 }),
    expected: '{"test":1}'
  });
});
describe("encodeToBase64", async assert => {
  assert({
    given: "no arguments or undefined",
    should: "throw",
    actual: Try(encodeToBase64, undefined),
    expected: new TypeError()
  });
  assert({
    given: "number",
    should: "throw",
    actual: Try(encodeToBase64, 1),
    expected: new TypeError()
  });
  assert({
    given: "null",
    should: "throw",
    actual: Try(encodeToBase64, null),
    expected: new TypeError()
  });
  assert({
    given: "string test",
    should: "return dGVzdA==",
    actual: encodeToBase64("test"),
    expected: "dGVzdA=="
  });
});

describe("normalizeDataToDcrtime", async assert => {
  assert({
    given: "no arguments or undefined",
    should: "throw",
    actual: Try(normalizeDataToDcrtime),
    expected: new TypeError()
  });
  assert({
    given: "non string argument",
    should: "throw",
    actual: Try(normalizeDataToDcrtime, 1),
    expected: new TypeError()
  });
  assert({
    given: "dGVzdA==",
    should: "return array with 1 object containing a payload key",
    actual: Try(normalizeDataToDcrtime, "dGVzdA=="),
    expected: ["dGVzdA=="]
  });
});

describe("cleanTweetText", async assert => {
  assert({
    given: "a text with tags in the beggining",
    should: "return the text without the tags",
    actual: Try(cleanTweetText, "@tag1 @tag2 text body"),
    expected: "text body"
  });
  assert({
    given: "a text with tags in the beggining and in the middle",
    should: "remove the tags from the beggning and keep the middle ones",
    actual: Try(cleanTweetText, "@tag1 @tag2 text body @midtag more text"),
    expected: "text body @midtag more text"
  });
  assert({
    given: "invalid input",
    should: "throw",
    actual: Try(cleanTweetText, null),
    expected: new TypeError()
  });
});

describe("validateTweet", async assert => {
  assert({
    given: "a invalid tweet text",
    should: "return false",
    actual: Try(validateTweet, { text: "@tag text body" }, "@tag"),
    expected: false
  });
  assert({
    given: "a valid tweet text",
    should: "return true",
    actual: Try(
      validateTweet,
      { text: "@tag text body @tag more text" },
      "@tag"
    ),
    expected: true
  });
  assert({
    given: "a text containing only the mention",
    should: "return true",
    actual: Try(validateTweet, { text: "@tag" }, "@tag"),
    expected: true
  });
  assert({
    given: "invalid input",
    should: "throw",
    actual: Try(validateTweet, null),
    expected: new TypeError()
  });
});
