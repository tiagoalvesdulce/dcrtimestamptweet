# Dcrtimestamptweet

Twitter bot to timestamp a thread when @dcrtimestamptweet is mentioned. This bot uses IPFS as a decentralized database to store the tweet thread. 

## Installation

1. Make a twitter development app and generate tokens: https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html

2. Make a .env File
    ```
    $ touch .env
    ```

3. Add the generated tokens
    ```
    TWITTER_CONSUMER_KEY=<GENERATED_API_KEY>
    TWITTER_CONSUMER_SECRET=<GENERATED_API_KEY_SECRET>
    TWITTER_ACCESS_TOKEN=<GENERATED_ACCESS_TOKEN>
    TWITTER_ACCESS_TOKEN_SECRET=<GENERATED_ACCESS_TOKEN_SECRET>
    TRACKED_WORD="@dcrtimestamptweet" // mention which will call the bot
    ```

4. Install IPFS
    
    4.1 IPFS Install instructions: https://docs.ipfs.io/introduction/install/

5. Run IPFS Daemon 
    ```
    ipfs daemon
    ```

6. Run yarn command
    ```
    $ yarn
    ```

7. Start app
    ```
    yarn start
    ```

Now when TRACKED_WORD is mentioned on some tweet the bot will save the thread at the ipfs and timestamp it and will tweet the hashes.

IPFS JSON generated

```
[{"user":{"id_str":"892766033714179434","name":"decred bot","screen_name":"decred_bot"},"id_str":"1116353485199556609","created_at":"Thu Apr 11 14:53:06 +0000 2019","text":"this is an awesome test! @dcrtimestamptweet","repliedid":null}]
```

Which is the file will be timestamped at dcrtime

## License

dcrtimestamptweet is licensed under the [copyfree](http://copyfree.org) ISC License.
