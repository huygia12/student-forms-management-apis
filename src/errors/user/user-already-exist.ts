import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class UserAlreadyExistError extends ResponsableError {
    StatusCode: number = StatusCodes.CONFLICT;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, UserAlreadyExistError.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default UserAlreadyExistError;
