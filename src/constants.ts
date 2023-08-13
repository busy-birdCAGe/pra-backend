export const port = 3000;
export const aws_region = process.env.AWS_REGION || "us-east-1";
export const user_table_name = process.env.TABLENAME || "dev-prayer-request-app-users";

export const errorMessages = {
    auth: {
        signUp: "An error occured during sign up",
        userNameExists: "User name already in use",
        emailExists: "Email already in use",
        invalidPassword: "Password does not meet requirements"
    }
}

export const successMessages = {
  general: "Success!"
};