import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  filter,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession } from '../auth/auth-session';
import { PreAuth } from '../auth/pre-auth';
import { RefreshResponse } from '../models/auth.models';

let refreshRequest$:
  Observable<RefreshResponse> | null = null;

const apiGatewayBaseUrl =
  environment.apiGatewayBaseUrl;

const identityApiBaseUrl =
  `${apiGatewayBaseUrl}/identity/api`;

const refreshUrl =
  `${identityApiBaseUrl}/auth/refresh`;

const loginUrl =
  `${identityApiBaseUrl}/auth/login`;

const customerRegistrationUrl =
  `${identityApiBaseUrl}/auth/register`;

const internalRegistrationUrl =
  `${identityApiBaseUrl}/auth/internal/register`;

const twoFactorEnrollmentUrl =
  `${identityApiBaseUrl}/auth/2fa/enroll`;

const twoFactorVerificationUrl =
  `${identityApiBaseUrl}/auth/2fa/verify`;

export const authInterceptor:
  HttpInterceptorFn = (
    request,
    next
  ) => {
    const authSession =
      inject(AuthSession);

    const preAuth =
      inject(PreAuth);

    const router =
      inject(Router);

    /*
     * Only process HTTP requests that are going
     * through the Ocelot API Gateway.
     */
    const isApiRequest =
      request.url.startsWith(
        `${apiGatewayBaseUrl}/`
      );

    if (!isApiRequest) {
      return next(request);
    }

    /*
     * IdentityService authentication endpoints.
     *
     * Ocelot exposes IdentityService as:
     *
     * /identity/api/{everything}
     *
     * which is forwarded downstream as:
     *
     * /api/{everything}
     */
    const isRefreshRequest =
      request.url === refreshUrl;

    const isLoginRequest =
      request.url === loginUrl;

    const isCustomerRegistration =
      request.url ===
      customerRegistrationUrl;

    const isInternalRegistration =
      request.url ===
      internalRegistrationUrl;

    const isTwoFactorEnrollment =
      request.url ===
      twoFactorEnrollmentUrl;

    const isTwoFactorVerification =
      request.url ===
      twoFactorVerificationUrl;

    const isTwoFactorRequest =
      isTwoFactorEnrollment ||
      isTwoFactorVerification;

    /*
     * Authentication endpoints must handle
     * their own 401 responses.
     *
     * We must not start automatic token refresh
     * when one of these endpoints returns 401,
     * otherwise recursive refresh behavior can
     * occur.
     */
    const skipAutomaticRefresh =
      isRefreshRequest ||
      isLoginRequest ||
      isCustomerRegistration ||
      isInternalRegistration ||
      isTwoFactorRequest;

    /*
     * Send credentials for API Gateway requests.
     *
     * This is required so that the IdentityService
     * refresh cookie can be sent through Ocelot.
     */
    let outgoingRequest =
      request.clone({
        withCredentials: true
      });

    const accessToken =
      authSession.accessToken;

    /*
     * Attach the operational JWT to normal API
     * requests.
     *
     * The refresh endpoint does not require the
     * access token because refresh authentication
     * is performed using the HttpOnly refresh
     * cookie.
     */
    if (
      accessToken &&
      !isRefreshRequest
    ) {
      outgoingRequest =
        addAccessToken(
          outgoingRequest,
          accessToken
        );
    }

    return next(
      outgoingRequest
    ).pipe(
      catchError(error => {
        /*
         * Only handle 401 Unauthorized here.
         *
         * Other responses such as:
         *
         * 400
         * 403
         * 404
         * 409
         * 500
         * 503
         *
         * are returned unchanged to the calling
         * component/service.
         */
        if (
          !(
            error instanceof
            HttpErrorResponse
          ) ||
          error.status !== 401
        ) {
          return throwError(
            () => error
          );
        }

        /*
         * Never automatically refresh authentication
         * endpoints themselves.
         */
        if (skipAutomaticRefresh) {
          return throwError(
            () => error
          );
        }

        /*
         * If PreAuth exists, login/2FA authentication
         * is still being established.
         *
         * Do not interfere with that workflow by
         * attempting normal session recovery.
         */
        if (preAuth.state()) {
          return throwError(
            () => error
          );
        }

        /*
         * There must already be an operational access
         * token for this to qualify as an expired
         * established session.
         *
         * Without one, there is nothing to refresh
         * automatically.
         */
        if (!authSession.accessToken) {
          return throwError(
            () => error
          );
        }

        /*
         * The protected request returned 401 while an
         * established Angular session existed.
         *
         * Perform one coordinated refresh and retry
         * the original request.
         */
        return refreshAndRetry(
          outgoingRequest,
          next,
          authSession,
          preAuth,
          router
        );
      })
    );
  };

function refreshAndRetry(
  originalRequest:
    HttpRequest<unknown>,
  next: HttpHandlerFn,
  authSession: AuthSession,
  preAuth: PreAuth,
  router: Router
) {
  /*
   * Multiple requests can return 401 at approximately
   * the same time.
   *
   * Only the first request creates the refresh call.
   * All other failed requests wait for the same shared
   * refresh Observable.
   */
  if (!refreshRequest$) {
    const refreshRequest =
      new HttpRequest(
        'POST',
        refreshUrl,
        {},
        {
          withCredentials: true
        }
      );

    refreshRequest$ =
      next(refreshRequest).pipe(
        /*
         * HttpHandlerFn returns HttpEvents.
         *
         * We only care about the completed
         * HttpResponse containing RefreshResponse.
         */
        filter(
          event =>
            event instanceof
            HttpResponse
        ),

        take(1),

        map(event => {
          const response =
            event as
              HttpResponse<RefreshResponse>;

          if (
            !response.body
              ?.accessToken
          ) {
            throw new Error(
              'Refresh response did not contain an access token.'
            );
          }

          /*
           * Replace the expired access token with
           * the newly issued operational JWT.
           */
          authSession.setAccessToken(
            response.body.accessToken
          );

          return response.body;
        }),

        catchError(error => {
          /*
           * The established refresh session is no
           * longer usable.
           *
           * Clear the frontend authentication state
           * and send the user to the session-expired
           * page.
           */
          authSession.clear();
          preAuth.clear();

          void router.navigate([
            '/session-expired'
          ]);

          return throwError(
            () => error
          );
        }),

        finalize(() => {
          refreshRequest$ = null;
        }),

        /*
         * Share one refresh operation between all
         * requests that failed with 401 concurrently.
         */
        shareReplay({
          bufferSize: 1,
          refCount: false
        })
      );
  }

  /*
   * Wait for the refresh operation.
   *
   * When it succeeds, retry the original request
   * with the newly issued access token.
   */
  return refreshRequest$.pipe(
    switchMap(
      refreshResponse => {
        const retryRequest =
          addAccessToken(
            originalRequest.clone({
              withCredentials: true
            }),
            refreshResponse.accessToken
          );

        return next(
          retryRequest
        );
      }
    )
  );
}

function addAccessToken(
  request:
    HttpRequest<unknown>,
  accessToken: string
): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization:
        `Bearer ${accessToken}`
    }
  });
}
