
import { createHash } from "node:crypto";


export function hashData(data:string){
    return createHash("sha256").update(data).digest("hex")
}

export function compareHash(data:string,hashedData:string){
    return hashedData === hashData(data)
}