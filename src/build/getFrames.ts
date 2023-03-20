import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { writeFileSync } from 'fs';

const client = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET as string,
  }
});

const saveFramesList = async () => {
  console.log('start')
  const command = new ListObjectsV2Command({
    Bucket: "random-moodboard",
    MaxKeys: 10000,
  });


  try {
    let isPartial = true;

    console.log("Your bucket contains the following objects:\n")
    let contents: string[] = [];

    while (isPartial) {
      const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
      if (!Contents) {
        break;
      }
      const contentsList = Contents.map((c) => c.Key as string);
      contents = [...contents, ...contentsList];
      isPartial = !!IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }
    const orderedResults = contents
      .filter((item: string) => item.includes('.png'))
      .sort((a: string, b: string) =>
        parseInt(a.replace('output/frame', '').replace('.png', ''))
        - parseInt(b.replace('output/frame', '').replace('.png', ''))
      );

    let data = JSON.stringify(orderedResults);
    writeFileSync('./src/frames.json', data);
  } catch (err) {
    console.error(err);
  }
};

saveFramesList()
export default saveFramesList;