import IPFS from "ipfs";
import logger from "../log.js";

export const ipfs = new IPFS({ silent: true });

export const addThreadToIPFS = async thread => {
  try {
    const files = [
      {
        path: "thread.json",
        content: ipfs.types.Buffer.from(thread)
      }
    ];
    const results = await ipfs.add(files);
    // const validate = await getFromIpfs();

    logger.verbose(`Thread added ${JSON.stringify(results[0], null, 2)}`);

    return results[0];
  } catch (e) {
    log.error(e);
    console.log(e);
  }
};

export const getFromIpfs = async () => {
  const res = await ipfs.get("QmSsGejdfLFeaoc3xY5y1YqVgacZ88ZgzLD3BoMCwugpE6");
};
