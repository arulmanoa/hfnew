export class LoginCredential {
    userName: string;
    password: string;
    grant_type: string;
}

export class Token {
    access_token: string;
    token_type: string;
    expires_in: string;
}

export class ClientLogin {
    clientCode : string;
    userName :string;
    password : string;
    
}
export class ForgotPassword {
    userName: string; // required, must be 5-8 characters
    MobileNo: string; // required, must be valid mobile format
  
}


