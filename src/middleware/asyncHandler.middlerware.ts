import { Request, Response, NextFunction } from 'express'

type AsyncControllerType = (req: Request, res: Response, next: NextFunction) => Promise<any>

//Middleware này sẽ giúp xử lý các lỗi bất đồng bộ trong controller
//Nếu có lỗi xảy ra, nó sẽ chuyển tiếp lỗi đó đến middleware xử lý lỗi
export const asyncHandler =
  (controller: AsyncControllerType): AsyncControllerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next)
    } catch (error) {
      next(error)
    }
  }
