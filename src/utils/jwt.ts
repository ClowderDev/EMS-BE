import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { Env } from '../config/env.config'

type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w' | 'y'
type TimeString = `${number}${TimeUnit}`

//Định nghĩa payload cho access token
//Chứa thông tin người dùng cần thiết để xác thực và phân quyền
export type AccessTokenPayload = {
  userId: string
}

//Dùng để các service có thể tùy chỉnh các tùy chọn khi ký token
type SignOptsAndSecret = SignOptions & {
  secret: string
  expiresIn?: TimeString | number
}

//Mặc định đối tượng là user
const defaults: SignOptions = {
  audience: ['user']
}

const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: Env.JWT_EXPIRATION as TimeString,
  secret: Env.JWT_SECRET
}

export const signJwtToken = (payload: AccessTokenPayload, options?: SignOptsAndSecret) => {
  //Nếu không có tùy chọn nào được cung cấp, sử dụng các tùy chọn mặc định
  const isAccessToken = !options || options === accessTokenSignOptions

  //Lấy ra secret, các tùy chọn khác
  const { secret, ...opts } = options || accessTokenSignOptions

  //Ký token với payload và secret
  //Nếu là access token, sử dụng các tùy chọn mặc định
  //Nếu không, sử dụng các tùy chọn được cung cấp
  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts
  })

  //Trả về thời gian hết hạn của token theo milliseconds
  const decoded = jwt.decode(token) as JwtPayload | null
  const expiresAt = isAccessToken && decoded?.exp !== undefined ? decoded.exp * 1000 : undefined

  return {
    token,
    expiresAt
  }
}
