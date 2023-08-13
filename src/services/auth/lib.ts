import {
  CognitoUserPool,
  CognitoUserAttribute,
  ISignUpResult,
} from "amazon-cognito-identity-js";
import { UserPoolConfig } from "../../env";
import { Table } from "../../dynamo";
import { user_table_name, errorMessages } from "../../constants";

const userPool = new CognitoUserPool(UserPoolConfig);
const userTable = new Table(user_table_name);

export async function createUser(
  userName: string,
  email: string,
  password: string
): Promise<void> {
  let existingUser = await userTable.get(
    "userName",
    userName,
    ["userName"],
    "UserNameIndex"
  );
  if (existingUser.length != 0) {
    throw new Error(errorMessages.auth.userNameExists);
  }
  let attributeList = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
  ];
  let signUpResult: ISignUpResult = await new Promise((resolve, reject) => {
    userPool.signUp(
      email,
      password,
      attributeList,
      [],
      function (err: any, result: any) {
        if (err) {
          if (err.code == "UsernameExistsException") {
            reject(new Error(errorMessages.auth.emailExists));
          } else if (err.code == "InvalidPasswordException") {
            reject(new Error(errorMessages.auth.invalidPassword));
          } else {
            console.error(err);
            reject(new Error(errorMessages.auth.signUp));
          }
        }
        if (result) {
          resolve(result);
        }
      }
    );
  });
  try {
    await userTable.put({
      userName: userName,
      email: email,
      sub: signUpResult.userSub,
    });
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.auth.signUp);
  }
  console.log(`New user added: userName=${userName} email=${email}`);
}
