//node js has its own error class thats why we extended the calls
class ApiError extends Error{
    constructor(statusCode,message="Somthing went wrong",errors=[],stack=""){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false
        this.errors=errors
        if (stack) {
            this.stack=stack
        }/*else{
            Error.captureStackTrac(this,this.constructor)
        }*/
    }
}
export {ApiError}