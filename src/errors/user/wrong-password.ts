import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class WrongPasswordError extends ResponsableError {
    StatusCode: number = StatusCodes.UNAUTHORIZED;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, WrongPasswordError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default WrongPasswordError;
