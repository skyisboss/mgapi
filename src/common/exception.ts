import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common'
import { Request, Response } from 'express'
import { HttpResponse } from '../util/helper'

@Catch() // 捕获所有异常
export class HttpExceptionFilter implements ExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // @todo 记录日志
    console.log(
      '%s %s error=> %s | body=> %s',
      request.method,
      request.url,
      exception.message,
      request.body,
      (exception as any)?.getResponse?.(),
    )
    if (exception instanceof BadRequestException) {
      const responseData = exception.getResponse() as any
      const status = exception.getStatus()

      //返回新的错误信息
      const msg = responseData.message
      const opt = {
        err: status,
        msg: Array.isArray(msg) ? msg.join() : msg,
      }
      return response.status(status).json(HttpResponse.error({}, opt))
    }
    const msg = exception?.message

    // 发送响应
    response.status(500).json(HttpResponse.error({}, { err: 500, msg }))
  }
}
