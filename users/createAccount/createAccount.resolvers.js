import client from "../../client"
import bcrypt from "bcrypt"

export default{
    Mutation:{
        
        createAccount:async(_,{
            firstName,
            lastName,
            username,
            email,
            password
        })=>{
            try{
            const existingUser = await client.user.findFirst({
                where:{
                    OR:[
                        {
                            username
                        },
                        {
                            email
                        }
                    ]
                }
            });
            if(existingUser){
                throw new Error("This username/password is already taken.")
            }
            const uglyPssword=await bcrypt.hash(password,10);
            await client.user.create({data:{
                username,email,firstName,lastName, password:uglyPssword
            }})
            return {
                ok: true,
              };
            } catch (e) {
              return {
                ok: false,
                error: "Can't create account.",
              }
            }
          },
        },
      };
      