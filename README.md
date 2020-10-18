# Chainlink NodeJS External Adapter TikTok
## Description 
This Chainlink adapter returns some information on the TikTok video requested

See [Install Locally](#install-locally) for a quickstart

## Deployed 
  * GCP: 
```
https://europe-west3-sponsorproject.cloudfunctions.net/external-adapter-tiktok
```

## Input Params

- `videoUrl`: The url of the video

## Output

```json
{
  "jobRunID": "1",
  "data": {
    "result": {
      "likesCount": 4133,
      "playCount": 18200,
      "commentCount": 58,
      "shareCount": 22,
      "createTime": "1602768853",
      "musicMeta": {
        "musicId": "6838952489585330949",
        "musicName": "ugly heart",
        "musicAuthor": "elfixsounds"
      },
      "musicUrl": "https://www.tiktok.com/music/ugly-heart-6838952489585330949?lang=en"
    }
  },
  "result": {
    "likesCount": 4133,
    "playCount": 18200,
    "commentCount": 58,
    "shareCount": 22,
    "createTime": "1602768853",
    "musicMeta": {
      "musicId": "6838952489585330949",
      "musicName": "ugly heart",
      "musicAuthor": "elfixsounds"
    },
    "musicUrl": "https://www.tiktok.com/music/ugly-heart-6838952489585330949?lang=en"
  },
  "statusCode": 200
}
```

## Data sources
https://www.tiktok.com/
## Tasks
``` json
{
  "initiators": [
    { "type": "runLog" }
  ],
  "tasks": [
    { "type": "tiktok" },
    { "type": "copy" },
    { "type": "ethuint256" },
    { "type": "ethtx" }
  ]
}
```
## Job Spec 
This is an example for retrieving likes or some uint in the result.
```json
{
  "initiators": [
    {
      "type": "runlog",
      "params": {
        "address": "YOUR_ORACLE_CONTRACT_ADDRESS"
      }
    }
  ],
  "tasks": [
    {
      "type": "tiktok"
    },
    {
      "type": "copy"
    },
    {
      "type": "ethuint256"
    },
    {
      "type": "ethtx"
    }
  ]
}
```

## Solidity interaction
```js
  function requestLikes(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillLikes.selector);
    req.add("videoUrl", "https://www.tiktok.com/@tiktok/video/6881450806688664838");
    req.add("copyPath", "result.likesCount");
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }
```
## Install Locally

Install dependencies:

```bash
yarn
```

Natively run the application (defaults to port 8080):

### Run

```bash
yarn start
```

## Call the external adapter/API server

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": { "videoUrl": "https://www.tiktok.com/@tiktok/video/6881450806688664838"} }'
```

## Docker

If you wish to use Docker to run the adapter, you can build the image by running the following command:

```bash
docker build . -t external-adapter
```

Then run it with:

```bash
docker run -p 8080:8080 -it external-adapter:latest
```

## Serverless hosts

After [installing locally](#install-locally):

### Create the zip

```bash
zip -r external-adapter.zip .
```

### Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `external-adapter.zip` file
- Handler:
    - index.handler for REST API Gateways
    - index.handlerv2 for HTTP API Gateways
- Add the environment variable (repeat for all environment variables):
  - Key: API_KEY
  - Value: Your_API_key
- Save

#### To Set Up an API Gateway (HTTP API)

If using a HTTP API Gateway, Lambda's built-in Test will fail, but you will be able to externally call the function successfully.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose HTTP API
- Select the security for the API
- Click Add

#### To Set Up an API Gateway (REST API)

If using a REST API Gateway, you will need to disable the Lambda proxy integration for Lambda-based adapter to function.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose REST API
- Select the security for the API
- Click Add
- Click the API Gateway trigger
- Click the name of the trigger (this is a link, a new window opens)
- Click Integration Request
- Uncheck Use Lamba Proxy integration
- Click OK on the two dialogs
- Return to your function
- Remove the API Gateway and Save
- Click Add Trigger and use the same API Gateway
- Select the deployment stage and security
- Click Add

### Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `external-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable (repeat for all environment variables)
  - NAME: API_KEY
  - VALUE: Your_API_key
