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

export async function getRequestsByChurch(
  churchIds: Array<string>,
  limit: number,
  offset: number
): Promise<Array<RequestView>> {
  try {
    let churchObjectIds = churchIds.map((id) => new ObjectId(id));
    let requestViews = await Database.getRequestsByChurches(churchObjectIds, limit, offset);
    return requestViews.map(
      ({ _id, text, anonymous, personal, userName }) =>
        anonymous
          ? { _id, text, anonymous, personal }
          : { _id, text, anonymous, personal, userName }
    );
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.get);
  }
}

export async function getAllRequests(
  limit: number,
  offset: number
): Promise<Array<RequestView>> {
  try {
    let requestViews = await Database.getAllRequests(limit, offset);
    return requestViews.map(
      ({ _id, text, anonymous, personal, userName }) =>
        anonymous
          ? { _id, text, anonymous, personal }
          : { _id, text, anonymous, personal, userName }
    );
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.get);
  }
}
