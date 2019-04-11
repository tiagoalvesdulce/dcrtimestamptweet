# Dcrtimestamptweet

Twitter bot to timestamp a thread when a chosen keyword is mentioned. This bot uses IPFS as a decentralized database to store the tweet thread json and uses [dcrtime](https://github.com/decred/dcrtime) for timestamping.


## Installation

1. Create a twitter account and [apply for access](https://developer.twitter.com/en/apply-for-access.html)

2. [Generate twitter access tokens](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html)

3. Make a .env File
    ```
    $ touch .env
    ```

4. Add the generated credentials in the `.env` file
    ```
    TWITTER_CONSUMER_KEY=<GENERATED_API_KEY>
    TWITTER_CONSUMER_SECRET=<GENERATED_API_KEY_SECRET>
    TWITTER_ACCESS_TOKEN=<GENERATED_ACCESS_TOKEN>
    TWITTER_ACCESS_TOKEN_SECRET=<GENERATED_ACCESS_TOKEN_SECRET>
    TRACKED_WORD="@dcrtimestamptweet" // mention which will call the bot
    ```

5. Run yarn command
    ```
    $ yarn
    ```

6. Start app
    ```
    yarn start
    ```

Now, when the `TRACKED_WORD` is mentioned on Twitter, the bot will save the thread to IPFS, timestamp it and reply the tweet with the SHA256 hash anchored to [dcrtime](https://github.com/decred/dcrtime) and the IPFS hash.


7. Example of stringified thread that will be timestamped and saved to IPFS

    ```
    [{"user":{"id_str":"892766033714179434","name":"decred bot","screen_name":"decred_bot"},"id_str":"1116353485199556609","created_at":"Thu Apr 11 14:53:06 +0000 2019","text":"this is an awesome test! @dcrtimestamptweet","repliedid":null}]
    ```

## Further information

It is not necessary to run IPFS in order to make the bot work properly, although it is good running your own daemon instance so you can test changes you've made.

### install IPFS

1. Follow the [IPFS Installation instructions](https://docs.ipfs.io/introduction/install/) 

2. Run IPFS Daemon 
    ```
    ipfs daemon
    ```


## License

dcrtimestamptweet is licensed under the [copyfree](http://copyfree.org) ISC License.
