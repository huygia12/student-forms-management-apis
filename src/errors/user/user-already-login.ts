import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class UserAlreadyLoginError extends ResponsableError {
    StatusCode: number = StatusCodes.BAD_REQUEST;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, UserAlreadyLoginError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default UserAlreadyLoginError;
