import Database from "../../database";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  ISignUpResult,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import { UserPoolConfig } from "../../env";
import { errorMessages } from "../../constants";

const userPool = new CognitoUserPool(UserPoolConfig);

export async function signUp(
  userName: string,
  email: string,
  password: string
): Promise<void> {
  let existingUser = await Database.getUserByName(userName);
  if (existingUser) {
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
          } else if (
            err.code == "InvalidPasswordException" ||
            err.code == "InvalidParameterException"
          ) {
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
    await Database.createUser(signUpResult.userSub, userName, email);
  } catch (error: any) {
    console.error(error);
    throw new Error(errorMessages.auth.signUp);
  }
  console.log(`New user added: userName=${userName} email=${email}`);
}

export async function signIn(
  userName: string | undefined,
  email: string | undefined,
  password: string
): Promise<Record<string, string>> {
  let email_param: string;
  if (userName) {
    let user = await Database.getUserByName(userName);
    if (!user) {
      throw new Error(errorMessages.auth.noUserWithUserName);
    }
    email_param = user.email;
  } else if (email) {
    email_param = email;
    let user = await Database.getUserByEmail(email);
    if (!user) {
      throw new Error(errorMessages.auth.noUserWithEmail);
    }
  } else {
    throw new Error(errorMessages.auth.signIn);
  }
  return await new Promise((resolve, reject) => {
    const userData = {
      Username: email_param,
      Pool: userPool,
    };
    let cognitoUser = new CognitoUser(userData);
    let authenticationData = {
      Username: email_param,
      Password: password,
    };
    let authenticationDetails = new AuthenticationDetails(authenticationData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        let accessToken = result.getAccessToken().getJwtToken();
        let refreshToken = result.getRefreshToken().getToken();
        resolve({
          accessToken,
          refreshToken,
        });
      },
      onFailure: function (error: any) {
        if (error.code == "UserNotConfirmedException") {
          reject(new Error(errorMessages.auth.emailNotConfirmed));
        } else if (error.code == "NotAuthorizedException") {
          reject(new Error(errorMessages.auth.wrongPassword));
        } else {
          console.error(error);
          reject(new Error(errorMessages.auth.signIn));
        }
      },
    });
  });
}
