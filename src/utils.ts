import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import jwt from "jsonwebtoken";
import { errorMessages } from "./constants";
import { UserPoolConfig } from "./env";

const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function getSSMSecret(name: string): Promise<string> {
  try {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });
    const response = await ssmClient.send(command);
    if (!response || !response.Parameter || !response.Parameter.Value) {
      throw new Error(errorMessages.ssm.noResponse);
    }
    return response.Parameter.Value;
  } catch (error: any) {
    throw new Error(error);
  }
}

export function decodeJwtToken(token: string): string {
  try {
    const decodedToken = jwt.decode(token, { complete: true });
    if (decodedToken && decodedToken.payload && decodedToken.payload.sub) {
      return decodedToken.payload.sub.toString();
    } else {
      throw new Error(errorMessages.jwt.decode);
    }
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.jwt.decode);
  }
}

export function generateRequestId(): number {
  const timestamp = Date.now().toString();
  const neededDigits = 15 - timestamp.length;
  if (neededDigits <= 0) {
    return parseInt(timestamp);
  } else {
    const randomDigits = Math.floor(
      Math.random() * Math.pow(10, neededDigits)
    ).toString();
    return parseInt(timestamp + randomDigits);
  }
}
