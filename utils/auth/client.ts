type AuthResult={data:{user:any;session?:any};error:any};

const requestInit = {
  credentials: "same-origin" as const,
  cache: "no-store" as const,
};

export function createAuthClient(){return{
 async getUser():Promise<AuthResult>{return (await fetch("/api/auth/me",requestInit)).json();},
 async signInWithPassword(input:{email:string;password:string}):Promise<AuthResult>{return (await fetch("/api/auth/signin",{...requestInit,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)})).json();},
 async signOut(){return (await fetch("/api/auth/signout",{...requestInit,method:"POST"})).json();},
 async updateUser(input:any):Promise<AuthResult>{return (await fetch("/api/auth/update",{...requestInit,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)})).json();},
 async resetPasswordForEmail(email:string,fullName:string=""):Promise<any>{const response=await fetch("/api/auth/reset-request",{...requestInit,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,fullName})}); return await response.json();},
 async updatePasswordWithToken(token:string,password:string):Promise<any>{const response=await fetch("/api/auth/reset-confirm",{...requestInit,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})}); return await response.json();},
 async verifyOtp(){return {error:new Error("Phone OTP is not used on Shoppers Ocean.")};}
};}