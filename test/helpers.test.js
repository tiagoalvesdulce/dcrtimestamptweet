import { describe, Try } from "riteway";
import { stringify, encodeToBase64, normalizeDataToDcrtime } from "../helpers";

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
    expected: "{\"test\":1}"
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

describe("normalizeDataToDcrtime", async (assert) => {
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
    expected: [{ payload: "dGVzdA==" }]
  });
});
