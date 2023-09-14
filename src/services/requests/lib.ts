import Database from "../../database";
import { RequestView } from "../../database";
import { ObjectId } from "mongodb";
import { errorMessages } from "../../constants";

export async function createRequest(
  text: string,
  userSub: string,
  churchIds: Array<string>,
  anonymous: boolean,
  personal: boolean
): Promise<void> {
  try {
    let churchObjectIds = churchIds.map((id) => new ObjectId(id));
    await Database.createRequest(
      text,
      userSub,
      churchObjectIds,
      anonymous,
      personal
    );
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.create);
  }
}

export async function getPublicRequestsByChurch(
  churchIds: Array<string>,
  limit: number,
  offset: number
): Promise<Array<RequestView>> {
  try {
    let churchObjectIds = churchIds.map((id) => new ObjectId(id));
    return await Database.getPublicRequestsByChurches(
      churchObjectIds,
      limit,
      offset
    );
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.get);
  }
}

export async function getAllPublicRequests(
  limit: number,
  offset: number
): Promise<Array<RequestView>> {
  try {
    return await Database.getAllPublicRequests(limit, offset);
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.get);
  }
}
