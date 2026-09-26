type AuthResult={data:{user:any;session?:any};error:any};
export function createAuthClient(){return{
 async getUser():Promise<AuthResult>{return (await fetch("/api/auth/me",{cache:"no-store"})).json();},
 async signInWithPassword(input:{email:string;password:string}):Promise<AuthResult>{return (await fetch("/api/auth/signin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)})).json();},
 async signOut(){return (await fetch("/api/auth/signout",{method:"POST"})).json();},
 async updateUser(input:any):Promise<AuthResult>{return (await fetch("/api/auth/update",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)})).json();},
 async verifyOtp(){return {error:new Error("Phone OTP is not used on Shoppers Ocean.")};}
};}
