// the response is handled by express that's why we createrd our own calss
class ApiResponse{
    constructor(stautusCode,data,message="Success"){
        this.stautusCode=stautusCode
        this.data=data
        this.message=message
        this.success=stautusCode<400
    }
}

export {ApiResponse}
