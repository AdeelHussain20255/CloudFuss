import { Storage } from 'megajs';

let megaInstance: InstanceType<typeof Storage> | null = null;

function getMegaClient() {
  if (!megaInstance) {
    megaInstance = new Storage({
      email: process.env.MEGA_EMAIL || "",
      password: process.env.MEGA_PASSWORD || "",
    });
  }
  return megaInstance;
}

export async function uploadToMega(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  const client = getMegaClient();

  await new Promise<void>((resolve, reject) => {
    client.login((err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Pass fileBuffer as the second argument to fix the TypeError crash in Vercel
  const stream = client.upload({
    name: fileName,
    size: fileBuffer.length,
  }, fileBuffer);

  const uploadedFile = await stream.complete;
  const link = await uploadedFile.link({});

  return link;
}

export async function getMegaStorageInfo(): Promise<{ used: number; total: number }> {
  const client = getMegaClient();

  await new Promise<void>((resolve, reject) => {
    client.login((err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const accountInfo = await new Promise<{ spaceUsed: number; spaceTotal: number }>((resolve, reject) => {
    client.getAccountInfo((err: Error | null, info: { spaceUsed: number; spaceTotal: number } | null) => {
      if (err) reject(err);
      else if (info) resolve(info);
      else reject(new Error("No account info"));
    });
  });

  return {
    used: accountInfo.spaceUsed,
    total: accountInfo.spaceTotal,
  };
}