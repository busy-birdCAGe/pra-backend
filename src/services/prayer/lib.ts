import Database from "../../database";
import { RequestView } from "../../database";
import { errorMessages } from "../../constants";

export async function createPrayee(
  userSub: string,
  requestId: number
): Promise<void> {
  try {
    await Database.createPrayee(userSub, requestId);
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.prayees.create);
  }
}

export async function deletePrayee(
  userSub: string,
  requestId: number
): Promise<void> {
  try {
    await Database.deletePrayee(userSub, requestId);
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.prayees.delete);
  }
}

export async function getPrayerList(
  userSub: string,
  limit: number,
  offset: number
): Promise<Array<RequestView>> {
  try {
    return await Database.getPrayerList(userSub, limit, offset);
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.get);
  }
}
