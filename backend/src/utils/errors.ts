import { BadGatewayException, HttpException } from '@nestjs/common';

export function throwUpstreamError(err: unknown): never {
  if (err instanceof HttpException) throw err;
  throw new BadGatewayException('Weather service unavailable');
}
