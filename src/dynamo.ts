import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
  ScanCommand,
  GetItemCommand,
  GetItemCommandInput,
  QueryCommandInput,
  UpdateItemCommandInput,
  PutItemCommandInput,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { aws_region } from "./constants";

export class Table {
  tableName: string;
  client: DynamoDBClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.client = new DynamoDBClient({
      region: aws_region,
    });
  }

  async get(key: string, value: any, columns: string[], indexName: string) {
    if (indexName) {
      const params: QueryCommandInput = {
        TableName: this.tableName,
        IndexName: indexName,
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
          "#pk": key,
        },
        ExpressionAttributeValues: {
          ":pk": { S: value },
        },
        ProjectionExpression: columns.join(","),
      };
      const command = new QueryCommand(params);
      const result = await this.client.send(command);
      return result.Items || [];
    } else {
      const params: GetItemCommandInput = {
        TableName: this.tableName,
        Key: {
          [key]: { S: value },
        },
        ProjectionExpression: columns.join(","),
      };
      const getItemCommand = new GetItemCommand(params);
      const result = await this.client.send(getItemCommand);
      return result.Item || [];
    }
  }

  async put(payload: Record<string, any>): Promise<void> {
    let params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(payload),
    };
    let command = new PutItemCommand(params);
    await this.client.send(command);
  }

  async update(pk: string, payload: Record<string, any>): Promise<void> {
    let keys = Object.keys(payload);
    let UE_ARRAY: string[] = [];
    let EAN: { [key: string]: string } = {};
    let EAV: { [key: string]: any } = {};
    for (let i = 0; i < keys.length; i++) {
      EAN[`#${i}`] = keys[i];
      EAV[`:${i}`] = payload[keys[i]];
      UE_ARRAY.push(`#${i} = :${i}`);
    }
    let UE = "SET " + UE_ARRAY.join(", ");
    let params: UpdateItemCommandInput = {
      TableName: this.tableName,
      Key: marshall({ email: pk }),
      UpdateExpression: UE,
      ExpressionAttributeNames: EAN,
      ExpressionAttributeValues: marshall(EAV),
    };
    let command = new UpdateItemCommand(params);
    await this.client.send(command);
  }
}
