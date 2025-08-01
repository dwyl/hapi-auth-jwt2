import { Request, ResponseObject, Plugin, ResponseToolkit } from '@hapi/hapi';
import { JwtPayload, VerifyOptions } from 'jsonwebtoken';

declare module '@hapi/hapi' {
    interface ServerAuth {
        strategy(name: string, scheme: 'jwt', options?: hapiAuthJwt2.Options): void;
    }
}

declare namespace hapiAuthJwt2 {
    interface ExtraInfo {
    }

    interface ErrorContext {
        /**
         * Boom method to call (eg. unauthorized)
         */
        errorType: string;
        /**
         * message passed into the Boom method call
         */
        message?: string;
        /**
         * schema passed into the Boom method call
         */
        schema: string;
        /**
         * attributes passed into the Boom method call
         */
        attributes?: {
            [key: string]: string;
        };
        /**
         * the exception thrown (e.g., by `jsonwebtoken.verify`)
         */
        error?: Error;
        /**
         * the decoded (possibly invalid) JWT received from the client
         */
        decoded?: JwtPayload;
    }

    interface ValidationResult {
        isValid: boolean;
        credentials?: any;
        response?: ResponseObject;
        errorMessage?: string;
    }

    /**
     * Options passed to `hapi.auth.strategy` when this plugin is used
     */
    interface Options {
        /**
         * The secret key used to check the signature of the token *or* a *key lookup function*
         */
        key?: string | string[] | Buffer | ((decodedToken: any) => Promise<{ key: string | string[]; extraInfo?: ExtraInfo }>);

        /**
         * The function which is run once the Token has been decoded
         *
         * @param decoded the *decoded* and *verified* JWT received from the client in *request.headers.authorization*
         * @param request the original *request* received from the client
         */
        validate(decoded: {}, request: Request, tk: ResponseToolkit): ValidationResult | Promise<ValidationResult>;

        /**
         * Settings to define how tokens are verified by the jsonwebtoken library
         */
        verifyOptions?: VerifyOptions;

        /**
         * function called to decorate the response with authentication headers
         * before the response headers or payload is written
         *
         * @param request the Request object
         * @param reply is called if an error occurred
         */
        responseFunc?(request: Request, reply: (err: any, response: ResponseObject) => void): void;

        /**
         *
         * @param ctx called when an error has been raised.
         * @param request the Request object.
         * @param h the ResponseToolkit object.
         * It provides an extension point to allow the host the ability to customise the error messages returned.
         */
        errorFunc?(ctx: ErrorContext, request: Request, h: ResponseToolkit): ErrorContext;

        /**
         * If you prefer to pass your token via url, simply add a token url
         * parameter to your request or use a custom parameter by setting `urlKey.
         * To disable the url parameter set urlKey to `false` or ''.
         * @default 'token'
         */
        urlKey?: string | boolean;

        /**
         * If you prefer to set your own cookie key or your project has a cookie
         * called 'token' for another purpose, you can set a custom key for your
         * cookie by setting `options.cookieKey='yourkeyhere'`. To disable cookies
         * set cookieKey to `false` or ''.
         * @default 'token'
         */
        cookieKey?: string | boolean;

        /**
         * If you want to set a custom key for your header token use the
         * `headerKey` option. To disable header token set headerKey to `false` or
         * ''.
         * @default 'authorization'
         */
        headerKey?: string | boolean;

        /**
         * If you want to set a custom key for your payload token use the
         * `payloadKey` option. To disable payload token set payloadKey to `false` or
         * ''.
         * @default 'token'
         */
        payloadKey?: string | boolean;

        /**
         * Allow custom token type, e.g. `Authorization: <tokenType> 12345678`
         */
        tokenType?: string;

        /**
         * Set to `true` to receive the complete token (`decoded.header`,
         * `decoded.payload` and `decoded.signature`) as decoded argument to key
         * lookup and `verifyFunc` callbacks (*not `validateFunc`*)
         * @default false
         */
        complete?: boolean;

        /**
         * Set to `true` to allow the `payloadFunc` to attempt to extract the token from
         * POST bodies
         * @default false
         */
        attemptToExtractTokenInPayload?: boolean;

        /**
         * Custom token extraction function used to allow consumers to pull tokens from
         * sources not foreseen by the module, for example... YAR
         * @default false
         */
        customExtractionFunc?(request: Request): string;
    }

    interface RegisterOptions {
        /**
         * function which is run once the Token has been decoded (instead of a validate) with signature async function(decoded, request) where:
         */
        verify?(decoded: any, request: Request): Promise<{
            isValid: boolean;
            credentials?: any;
        }>;
    }
}

declare const hapiAuthJwt2: Plugin<hapiAuthJwt2.RegisterOptions>;

export = hapiAuthJwt2;
