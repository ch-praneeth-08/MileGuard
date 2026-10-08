import {
  HttpInterceptorFn
} from '@angular/common/http';
import {
  environment
} from '../../../environments/environment';

const correlationIdHeader =
  'X-Correlation-Id';

export const correlationIdInterceptor:
  HttpInterceptorFn = (
    request,
    next
  ) => {
    const isApiRequest =
      request.url.startsWith(
        `${environment.apiGatewayBaseUrl}/`
      );

    /*
     * Do not add correlation IDs to unrelated
     * HTTP requests.
     */
    if (!isApiRequest) {
      return next(request);
    }

    /*
     * Preserve an existing correlation ID if
     * another caller has already supplied one.
     */
    const existingCorrelationId =
      request.headers.get(
        correlationIdHeader
      );

    if (existingCorrelationId) {
      return next(request);
    }

    const correlationId =
      crypto.randomUUID();

    return next(
      request.clone({
        setHeaders: {
          [correlationIdHeader]:
            correlationId
        }
      })
    );
  };
