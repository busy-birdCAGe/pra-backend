import { MongoClient, Db, ObjectId, Collection } from "mongodb";
import { getSSMSecret } from "./utils";
import {
  mongo_database_name,
  request_collection_name,
  users_collection_name,
  churches_collection_name,
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
  userName?: string;
  anonymous: boolean;
  personal: boolean;
};

type UserDocument = {
  _id: string;
  userName: string;
  email: string;
};

type ChurchDocument = {
  _id: ObjectId;
  name: string;
};

class Database {
  private mongo_url!: string;
  private client!: MongoClient;
  private db!: Db;
  private requests_collection!: Collection<RequestDocument>;
  private churches_collection!: Collection<ChurchDocument>;
  private users_collection!: Collection<UserDocument>;

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
    return request;
  }

  public async getRequestsByChurches(
    churchIds: ObjectId[],
    limit: number,
    offset: number
  ): Promise<RequestView[]> {
    await this.connect();
    return await this.requests_collection
      .aggregate([
        {
          $match: {
            churchIds: { $in: churchIds },
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
            anonymous: 1,
            personal: 1,
            userName: "$user.userName",
          },
        },
      ])
      .toArray() as RequestView[];
  }

  public async getAllRequests(
    limit: number,
    offset: number
  ): Promise<RequestView[]> {
    await this.connect();
    return await this.requests_collection
      .aggregate([
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
            anonymous: 1,
            personal: 1,
            userName: "$user.userName",
          },
        },
      ])
      .toArray() as RequestView[];
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
}

export default new Database();
