import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { writeFileSync } from 'fs';
// @ts-ignore
import probe from 'probe-image-size';
import { ASSET_URL } from "../App";

const client = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET as string,
  }
});

const getImg = async (url: string) => {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode()
  return img;
};

const saveFramesList = async () => {
  console.log('start')
  const command = new ListObjectsV2Command({
    Bucket: "random-moodboard",
    MaxKeys: 500,
  });

  try {
    let image;
    while (!image) {
      let contents: string[] = [];

      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
      const images = Contents?.filter((item) => item.Key?.includes('.jpg') || item.Key?.includes('.png')) ?? [];
      if (images[0]) {
        image = images[0].Key as string;
      }
    }

    let result = await probe(`${ASSET_URL}/${image}`);
    let dimensions = JSON.stringify(result);
    writeFileSync('./public/dimensions.json', dimensions);
  } catch (err) {
    console.error(err);
  }
};

saveFramesList()
export default saveFramesList;