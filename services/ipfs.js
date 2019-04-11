import IPFS from "ipfs";
import logger from "../log.js";

export const ipfs = new IPFS({ silent: false });

export const addThreadToIPFS = filename => async thread => {
  try {
    const files = [
      {
        path: "timestampedthreads/" + filename,
        content: ipfs.types.Buffer.from(thread)
      }
    ];
    const results = await ipfs.add(files);
    // const validate = await getFromIpfs();

    logger.debug(`Thread added ${JSON.stringify(results, null, 2)}`);
    ipfs.pin.add(results[0].hash, (error, res) => {
      logger.debug(`ipfs pin result: ${JSON.stringify(res)}`, res);
      if (error) log.error("error pinning the hash:", error);
    });

    return results[0];
  } catch (e) {
    throw e;
  }
};

export const getFromIpfs = async () => {
  const res = await ipfs.get("QmSsGejdfLFeaoc3xY5y1YqVgacZ88ZgzLD3BoMCwugpE6");
};
