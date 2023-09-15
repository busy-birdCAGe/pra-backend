import Database from "../../database";
import { ObjectId } from "mongodb";
import { UserView } from "../../database";
import { errorMessages } from "../../constants";

export async function getUser(
  userSub: string
): Promise<UserView> {
  try {
    let user = await Database.getUserBySub(userSub);
    if (!user) {
      throw new Error(errorMessages.users.get)
    }
    let stringChurchIds = user.churches.map(churchId => churchId.toString())
    let userView = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      churches: stringChurchIds,
    };
    return userView;
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.requests.get);
  }
}
