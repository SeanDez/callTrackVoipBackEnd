import * as isRequest from "./isRequest"
// @ponicode
describe("isRequest.default", () => {
    test("0", () => {
        let callFunction: any = () => {
            isRequest.default(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            isRequest.default({ localUserName: "user name", localPassword: "user name" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            isRequest.default({ localUserName: 123, localPassword: "user-name" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            isRequest.default({ localUserName: "username", localPassword: 123 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            isRequest.default({ localUserName: "user_name", localPassword: "user name" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            isRequest.default({ localUserName: "", localPassword: "" })
        }
    
        expect(callFunction).not.toThrow()
    })
})
