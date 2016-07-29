/// <reference path="../../typings/index.d.ts" />
"use strict";

import {InternalServer} from "./server-container"
import {HttpMethod, ServiceContext} from "./server-types"
import * as metadata from "./metadata"

import "reflect-metadata"

/**
 * A decorator to tell the [[Server]] that a class or a method 
 * should be bound to a given path.
 * 
 * For example:
 *
 * ```
 * @ Path("people")
 * class PeopleService {
 *   @ PUT
 *   @ Path(":id")
 *   savePerson(person:Person) {
 *      // ...
 *   }
 * 
 *   @ GET
 *   @ Path(":id")
 *   getPerson():Person {
 *      // ...
 *   }
 * }
 * ```
 *
 * Will create services that listen for requests like:
 *
 * ```
 * PUT http://mydomain/people/123 or
 * GET http://mydomain/people/123 
 * ```
 */
export function Path(path: string) {
    return function (...args: any[]) {
	    if (args.length == 1) {
	        return PathTypeDecorator.apply(this, [args[0], path]);
	    }
	    else if (args.length == 3 && typeof args[2] === "object") {
	        return PathMethodDecorator.apply(this, [args[0], args[1], args[2], path]);
	    }

	    throw new Error("Invalid @Path Decorator declaration.");
	}
}

/**
 * A decorator to tell the [[Server]] that a class or a method 
 * should only accept requests from clients that accepts one of 
 * the supported languages.
 * 
 * For example:
 *
 * ```
 * @ Path("accept")
 * @ AcceptLanguage("en", "pt-BR")
 * class TestAcceptService {
 *      // ...
 * }
 * ```
 *
 * Will reject requests that only accepts languages that are not
 * English or Brazilian portuguese
 *
 * If the language requested is not supported, a status code 406 returned
 */
export function AcceptLanguage(...languages: string[]) {
    return function (...args: any[]) {
	    if (args.length == 1) {
	        return AcceptLanguageTypeDecorator.apply(this, [args[0], languages]);
	    }
	    else if (args.length == 3 && typeof args[2] === "object") {
	        return AcceptLanguageMethodDecorator.apply(this, [args[0], args[1], args[2], languages]);
	    }

	    throw new Error("Invalid @AcceptLanguage Decorator declaration.");
	}
}

/**
 * A decorator to tell the [[Server]] that a class or a method 
 * should only accept requests from clients that accepts one of 
 * the supported mime types.
 * 
 * For example:
 *
 * ```
 * @ Path("accept")
 * @ Accept("application/json")
 * class TestAcceptService {
 *      // ...
 * }
 * ```
 *
 * Will reject requests that only accepts mime types that are not
 * "application/json""
 *
 * If the mime type requested is not supported, a status code 406 returned
 */
export function Accept(...accepts: string[]) {
    return function (...args: any[]) {
	    if (args.length == 1) {
	        return AcceptTypeDecorator.apply(this, [args[0], accepts]);
	    }
	    else if (args.length == 3 && typeof args[2] === "object") {
	        return AcceptMethodDecorator.apply(this, [args[0], args[1], args[2], accepts]);
	    }

	    throw new Error("Invalid @Accept Decorator declaration.");
	}
}

/**
 * A decorator to used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * [[ServiceContext]] object associated to the current request.
 * 
 * For example:
 *
 * ```
 * @ Path("accept")
 * @ Accept("application/json")
 * class TestAcceptService {
 *   @ Context
	 context: ServiceContext;
 *       // ...
 * }
 * ```
 *
 * The field context on the above class will point to the current 
 * [[ServiceContext]] instance.
 */
export function Context(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([metadata.ParamType.context]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([metadata.ParamType.context, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @Context Decorator declaration.");	
}

/**
 * A decorator to used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the current request.
 * 
 * For example:
 *
 * ```
 * @ Path("accept")
 * @ Accept("application/json")
 * class TestAcceptService {
 *   @ ContextRequest
	 request: express.Request;
 *       // ...
 * }
 * ```
 *
 * The field request on the above class will point to the current 
 * request.
 */
export function ContextRequest(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([metadata.ParamType.context_request]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([metadata.ParamType.context_request, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @ContextRequest Decorator declaration.");	
}

/**
 * A decorator to used on class properties or on service method arguments
 * to inform that the decorated property or argument should be bound to the
 * the current response object.
 * 
 * For example:
 *
 * ```
 * @ Path("accept")
 * @ Accept("application/json")
 * class TestAcceptService {
 *   @ ContextResponse
	 response: express.Response;
 *       // ...
 * }
 * ```
 *
 * The field response on the above class will point to the current 
 * response object.
 */
export function ContextResponse(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([metadata.ParamType.context_response]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([metadata.ParamType.context_response, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @ContextResponse Decorator declaration.");	
}

export function ContextNext(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([metadata.ParamType.context_next]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([metadata.ParamType.context_next, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @ContextNext Decorator declaration.");	
}

export function ContextLanguage(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([metadata.ParamType.context_accept_language]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([metadata.ParamType.context_accept_language, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @ContextLanguage Decorator declaration.");	
}

export function ContextAccept(...args: any[]) {
    if (args.length == 2) {
    	let newArgs = args.concat([metadata.ParamType.context_accept]);
        return processDecoratedProperty.apply(this, newArgs);
    }
    else if (args.length == 3 && typeof args[2] === "number") {
    	let newArgs = args.concat([metadata.ParamType.context_accept, null]);
        return processDecoratedParameter.apply(this, newArgs);
    }

    throw new Error("Invalid @ContextAccept Decorator declaration.");	
}

export function GET(target: any, propertyKey: string,
	descriptor: PropertyDescriptor){
    processHttpVerb(target, propertyKey, HttpMethod.GET);
}

export function POST(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.POST);
}

export function PUT(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.PUT);
}

export function DELETE(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.DELETE);
}

export function HEAD(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.HEAD);
}

export function OPTIONS(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.OPTIONS);
}

export function PATCH(target: any, propertyKey: string,
	descriptor: PropertyDescriptor) {
    processHttpVerb(target, propertyKey, HttpMethod.PATCH);
}

export function PathParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.path, name);
	}
}

export function FileParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.file, name);
	}
}

export function FilesParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.files, name);
	}
}

export function QueryParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.query, name);
	}
}

export function HeaderParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.header, name);
	}
}

export function CookieParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.cookie, name);
	}
}

export function FormParam(name: string) {
    return function(target: Object, propertyKey: string, parameterIndex: number) {
		processDecoratedParameter(target, propertyKey, parameterIndex, metadata.ParamType.form, name);
	}
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on classes
 */
function AcceptLanguageTypeDecorator(target: Function, languages: string[]) {
	let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
	classData.languages = languages;
}

/**
 * Decorator processor for [[AcceptLanguage]] decorator on methods
 */
function AcceptLanguageMethodDecorator(target: any, propertyKey: string, 
			descriptor: PropertyDescriptor, languages: string[]) {
	let serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		serviceMethod.languages = languages;
    }
}

/**
 * Decorator processor for [[Accept]] decorator on classes
 */
function AcceptTypeDecorator(target: Function, accepts: string[]) {
	let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
	classData.accepts = accepts;
}

/**
 * Decorator processor for [[Accept]] decorator on methods
 */
function AcceptMethodDecorator(target: any, propertyKey: string, 
			descriptor: PropertyDescriptor, accepts: string[]) {
	let serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		serviceMethod.accepts = accepts;
    }
}

/**
 * Decorator processor for [[Path]] decorator on classes
 */
function PathTypeDecorator(target: Function, path: string) {
	let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target);
	classData.path = path;
}

/**
 * Decorator processor for [[Path]] decorator on methods
 */
function PathMethodDecorator(target: any, propertyKey: string, 
			descriptor: PropertyDescriptor, path: string) {
	let serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		serviceMethod.path = path;
    }
}

/**
 * Decorator processor for parameter annotations on methods
 */
function processDecoratedParameter(target: Object, propertyKey: string, parameterIndex: number, 
	paramType: metadata.ParamType, name: string) {
	let serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target.constructor, propertyKey);
	if (serviceMethod) { // does not intercept constructor
		let paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);

		while (serviceMethod.parameters.length < paramTypes.length) {
			serviceMethod.parameters.push(new metadata.MethodParam(null, 
						paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
		}
		serviceMethod.parameters[parameterIndex] = new metadata.MethodParam(name, paramTypes[parameterIndex], paramType);
	}
}

/**
 * Decorator processor for annotations on properties
 */
function processDecoratedProperty(target: Function, key: string, paramType: metadata.ParamType) {
	let classData: metadata.ServiceClass = InternalServer.registerServiceClass(target.constructor);
    classData.addProperty(key, paramType);
}


/**
 * Decorator processor for HTTP verb annotations on methods
 */
function processHttpVerb(target: any, propertyKey: string,
	httpMethod: HttpMethod) {
	let serviceMethod: metadata.ServiceMethod = InternalServer.registerServiceMethod(target, propertyKey);
    if (serviceMethod) { // does not intercept constructor
		if (serviceMethod.httpMethod) {
			throw new Error("Method is already annotated with @" +
				serviceMethod.httpMethod +
				". You can only map a method to one HTTP verb.");
		}
		serviceMethod.httpMethod = httpMethod;
		processServiceMethod(target, propertyKey, serviceMethod);
    }
}

/**
 * Extract metadata for rest methods
 */
function processServiceMethod(target: any, propertyKey: string, serviceMethod: metadata.ServiceMethod) {
	serviceMethod.name = propertyKey;
	serviceMethod.returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
	let paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
	while (paramTypes.length > serviceMethod.parameters.length) {
		serviceMethod.parameters.push(new metadata.MethodParam(null,
			paramTypes[serviceMethod.parameters.length], metadata.ParamType.body));
	}

	serviceMethod.parameters.forEach(param => {
		if (param.paramType == metadata.ParamType.cookie) {
			serviceMethod.mustParseCookies = true;
		}
		else if (param.paramType == metadata.ParamType.file) {
			serviceMethod.files.push(new metadata.FileParam(param.name, true));
		}
		else if (param.paramType == metadata.ParamType.files) {
			serviceMethod.files.push(new metadata.FileParam(param.name, false));
		}
		else if (param.paramType == metadata.ParamType.form) {
			if (serviceMethod.mustParseBody) {
				throw Error("Can not use form parameters with a body parameter on the same method.");
			}
			serviceMethod.mustParseForms = true;
		}
		else if (param.paramType == metadata.ParamType.body) {
			if (serviceMethod.mustParseForms) {
				throw Error("Can not use form parameters with a body parameter on the same method.");
			}
			if (serviceMethod.mustParseBody) {
				throw Error("Can not use more than one body parameter on the same method.");
			}
			serviceMethod.mustParseBody = true;
		}
	});
}