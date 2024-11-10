import {StatusCodes} from "http-status-codes";
import {ResponsableError} from "../custom-error";

class UserCannotBeDeleted extends ResponsableError {
    StatusCode: number = StatusCodes.CONFLICT;
    constructor(public message: string) {
        super(message);
        Object.setPrototypeOf(this, UserCannotBeDeleted.prototype);
    }
    serialize(): {message: string} {
        return {message: this.message};
    }
}

export default UserCannotBeDeleted;
