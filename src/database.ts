import { MongoClient, Db, ObjectId, Collection } from "mongodb";
import { getSSMSecret } from "./utils";
import {
  mongo_database_name,
  request_collection_name,
  users_collection_name,
  churches_collection_name,
  prayee_collection_name,
} from "./constants";
import { generateRequestId } from "./utils";
import { mongo_url_ssm } from "./env";

type RequestDocument = {
  _id: number;
  text: string;
  userSub: string;
  churchIds: ObjectId[];
  anonymous: boolean;
  personal: boolean;
};

export type RequestView = {
  _id: number;
  text: string;
  userName: string | null;
};

type UserDocument = {
  _id: string;
  userName: string;
  email: string;
  churches: Array<ObjectId>;
};

export type UserView = {
  _id: string;
  userName: string;
  email: string;
  churches: Array<string>;
};

type ChurchDocument = {
  _id: ObjectId;
  name: string;
};

type PrayeeDocument = {
  _id: ObjectId;
  userSub: string;
  requestId: number;
};

class Database {
  private mongo_url!: string;
  private client!: MongoClient;
  private db!: Db;
  private requests_collection!: Collection<RequestDocument>;
  private churches_collection!: Collection<ChurchDocument>;
  private users_collection!: Collection<UserDocument>;
  private prayee_collection!: Collection<PrayeeDocument>;

  private async connect(): Promise<void> {
    if (!this.mongo_url) {
      this.mongo_url = await getSSMSecret(mongo_url_ssm);
      this.client = new MongoClient(this.mongo_url);
      this.db = this.client.db(mongo_database_name);
      this.requests_collection = this.db.collection<RequestDocument>(
        request_collection_name
      );
      this.churches_collection = this.db.collection<ChurchDocument>(
        churches_collection_name
      );
      this.users_collection = this.db.collection<UserDocument>(
        users_collection_name
      );
      this.prayee_collection = this.db.collection<PrayeeDocument>(
        prayee_collection_name
      );
    }
  }

  public async createRequest(
    text: string,
    userSub: string,
    churchIds: ObjectId[],
    anonymous: boolean,
    personal: boolean
  ): Promise<RequestDocument> {
    const request: RequestDocument = {
      text,
      userSub,
      churchIds,
      anonymous,
      personal,
      _id: generateRequestId(),
    };
    await this.connect();
    await this.requests_collection.insertOne(request);
    await this.createPrayee(userSub, request._id);
    return request;
  }

  public async getPublicRequestsByChurches(
    churchIds: ObjectId[],
    limit: number,
    offset: number
  ): Promise<RequestView[]> {
    await this.connect();
    return (await this.requests_collection
      .aggregate([
        {
          $match: {
            churchIds: { $in: churchIds },
            personal: false,
          },
        },
        {
          $lookup: {
            from: users_collection_name,
            localField: "userSub",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            text: 1,
            userName: {
              $cond: {
                if: { $eq: ["$anonymous", false] },
                then: "$user.userName",
                else: null,
              },
            },
          },
        },
      ])
      .toArray()) as RequestView[];
  }

  public async getAllPublicRequests(
    limit: number,
    offset: number
  ): Promise<RequestView[]> {
    await this.connect();
    return (await this.requests_collection
      .aggregate([
        {
          $match: {
            personal: false,
          },
        },
        {
          $lookup: {
            from: users_collection_name,
            localField: "userSub",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            text: 1,
            userName: {
              $cond: {
                if: { $eq: ["$anonymous", false] },
                then: "$user.userName",
                else: null,
              },
            },
          },
        },
      ])
      .toArray()) as RequestView[];
  }

  public async createUser(
    userSub: string,
    userName: string,
    email: string
  ): Promise<UserDocument> {
    const user: UserDocument = {
      userName,
      email,
      _id: userSub,
      churches: []
    };
    await this.connect();
    await this.users_collection.insertOne(user);
    return user;
  }

  public async getUserBySub(userSub: string): Promise<UserDocument | null> {
    await this.connect();
    return this.users_collection.findOne({ _id: userSub });
  }

  public async getUserByName(userName: string): Promise<UserDocument | null> {
    await this.connect();
    return this.users_collection.findOne({ userName });
  }

  public async getUserByEmail(email: string): Promise<UserDocument | null> {
    await this.connect();
    return this.users_collection.findOne({ email });
  }

  public async createChurch(name: string): Promise<ChurchDocument> {
    await this.connect();
    const church: ChurchDocument = {
      name,
      _id: new ObjectId(),
    };
    await this.churches_collection.insertOne(church);
    return church;
  }

  public async getChurchById(
    churchId: ObjectId
  ): Promise<ChurchDocument | null> {
    await this.connect();
    return this.churches_collection.findOne({ _id: churchId });
  }

  public async createPrayee(
    userSub: string,
    requestId: number
  ): Promise<PrayeeDocument> {
    await this.connect();
    const prayee: PrayeeDocument = {
      _id: new ObjectId(),
      userSub,
      requestId,
    };
    await this.prayee_collection.insertOne(prayee);
    return prayee;
  }

  public async deletePrayee(userSub: string, requestId: number): Promise<void> {
    await this.connect();
    await this.prayee_collection.deleteOne({ userSub, requestId });
  }

  public async getPrayerList(
    userSub: string,
    limit: number,
    offset: number
  ): Promise<Array<RequestView>> {
    await this.connect();
    return (await this.prayee_collection
      .aggregate([
        {
          $match: {
            userSub,
          },
        },
        {
          $sort: {
            requestId: -1,
          },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: request_collection_name,
            localField: "requestId",
            foreignField: "_id",
            as: "request",
          },
        },
        {
          $unwind: "$request",
        },
        {
          $lookup: {
            from: users_collection_name,
            localField: "request.userSub",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            _id: "$request._id",
            text: "$request.text",
            userName: {
              $cond: {
                if: { $eq: ["$request.anonymous", false] },
                then: "$user.userName",
                else: null,
              },
            },
          },
        },
      ])
      .toArray()) as RequestView[];
  }
}

export default new Database();
