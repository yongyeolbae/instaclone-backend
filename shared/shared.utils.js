import AWS from "aws-sdk";
AWS.config.update({
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const uploadToS3 = async (file, userId, folderName) => {
  const { filename, createReadStream } = await file;
  const readStream = createReadStream();
  const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
  const { Location } = await new AWS.S3()
    .upload({
      Bucket: "byy-instaclone-uploads",
      Key: objectName,
      ACL: "public-read",
      Body: readStream,
    })
    .promise();
  return Location;
};

const s3 = new AWS.S3();

// AWS에서 사진을 삭제하는 함수
export const handleDeletePhotoFromAWS = async (fileUrl) => {
const decodedUrl = decodeURI(fileUrl);
const filePath = decodedUrl.split("/uploads/")[1];
const bucketName = "byy-instaclone-uploads"; // 본인 버킷 이름
const fileName = `uploads/${filePath}`;

const params = {
Bucket: bucketName,
Key: fileName,
};

await s3.deleteObject(params).promise();
};