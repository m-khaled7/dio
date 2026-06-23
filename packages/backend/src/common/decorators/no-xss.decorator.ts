
import { registerDecorator, ValidationOptions } from "class-validator"
import xss from "xss"

export function NoXss(options?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "noXss",
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} contains potentially unsafe content`,
                ...options,
            },
            validator: {
                validate(value: unknown): boolean {
                    if (typeof value !== "string") return true
                    return xss(value) === value 
                },
            },
        })
    }
}