export const port = 3000;
export const mongo_database_name = "prayer_request_app";
export const request_collection_name = "requests";
export const churches_collection_name = "churches";
export const users_collection_name = "users";
export const prayee_collection_name = "prayees";

export const errorMessages = {
  auth: {
    signUp: "An error occured during sign up",
    signIn: "An error occured during sign in",
    userNameExists: "User name already in use",
    emailExists: "Email already in use",
    invalidPassword: "Password does not meet requirements",
    noUserWithUserName: "A user does not exist with that user name",
    noUserWithEmail: "A user does not exist with that email",
    emailNotConfirmed: "Your email must first be confirmed",
    wrongPassword: "Invalid password",
  },
  requests: {
    create: "An error occured when creating your request",
    get: "An error occured when gathering requests",
  },
  prayees: {
    create: "An error occured when adding request to your list",
    delete: "An error occured when removing request to your list",
  },
  ssm: {
    noResponse: "SSM response is missing required data",
  },
  jwt: {
    decode: "Could not decode JWT token",
  },
};

export const successMessages = {
  general: "Success!",
};
