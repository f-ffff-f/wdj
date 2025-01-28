import { UserDTO } from './dto'

// api/user/me
export type UserMeAPI = { Response: UserDTO }

// api/user/login
export type UserLoginAPI = {
    Request: { email: string; password: string }
    Response: { message: string; token: string } & UserDTO
}
