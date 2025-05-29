/**
 * @file catchError.ts
 * @description 通用的错误处理工具函数，支持异步和同步操作的错误捕获、重试、超时和日志记录。
 */

// --- 核心类型定义 ---

/**
 * @class TimeoutError
 * @description 表示操作超时的自定义错误类型。
 */
export class TimeoutError extends Error {
	constructor(message = "Operation timed out") {
		super(message);
		this.name = "TimeoutError";
		// 在 TypeScript 中，当目标是 ES5 或更低版本时，需要手动设置原型链
		Object.setPrototypeOf(this, TimeoutError.prototype);
	}
}

/**
 * @type ErrorResult
 * @description 包装操作结果，可能包含成功时的数据或发生的错误，以及相关的元数据。
 * @template T - 成功时数据的类型。
 * @template E - 错误对象的类型，默认为 Error。
 */
export type ErrorResult<T, E extends Error = Error> = {
	data?: T; // 操作成功时的数据
	error?: E | TimeoutError; // 操作失败时的错误对象 (可能是 TimeoutError)
	meta: {
		executionTime: number; // 总执行时间 (毫秒)
		retryCount?: number; // 实际执行的重试次数
		retryErrors?: (E | TimeoutError)[]; // 每次重试时捕获的错误数组
		isTimeout?: boolean; // 标记是否发生了超时
		[key: string]: unknown; // 允许用户添加其他自定义元数据 (类型为 unknown 以增强类型安全)
	};
};

/**
 * @type LogOnErrorFormatterParams
 * @description `logOnError` 自定义格式化函数的参数类型。
 * @template E - 错误对象的类型。
 */
export type LogOnErrorFormatterParams<E extends Error = Error> = {
	error: E | TimeoutError; // 发生的错误对象
	meta: ErrorResult<unknown, E>["meta"]; // 错误相关的元数据 (使用 unknown 作为数据类型 T)
	attempt?: number; // 错误发生时的当前尝试次数 (用于异步重试)
	maxAttempts?: number; // 最大尝试次数 (用于异步重试)
};

/**
 * @type LogOnErrorFormatterResult
 * @description `logOnError` 自定义格式化函数的返回值类型。
 * 可以是字符串、结构化日志对象，或者 null/undefined (用于禁止当前错误的日志记录)。
 */
export type LogOnErrorFormatterResult =
	| string
	| { message: string; [key: string]: unknown } // 结构化日志对象的额外属性类型为 unknown
	| null
	| undefined;

/**
 * @type OnErrorCallbackParams
 * @description `onError` 回调函数的参数类型。
 * @template E - 错误对象的类型。
 */
export type OnErrorCallbackParams<E extends Error = Error> = {
	error: E | TimeoutError; // 发生的错误对象
	meta: ErrorResult<unknown, E>["meta"]; // 错误相关的元数据
	attempt?: number; // 错误发生时的当前尝试次数 (用于异步重试)
	maxAttempts?: number; // 最大尝试次数 (用于异步重试)
	isRetrying?: boolean; // 是否会进行重试
	isFinalError?: boolean; // 是否为最终错误（不会再重试）
};

/**
 * @interface Logger
 * @description 定义了一个通用的日志记录器接口，以便用户可以集成自己的日志库。
 */
export interface Logger {
	error: (message: string, ...optionalParams: unknown[]) => void;
	warn: (message: string, ...optionalParams: unknown[]) => void;
	info: (message: string, ...optionalParams: unknown[]) => void;
	debug: (message: string, ...optionalParams: unknown[]) => void;
}

/**
 * @type CatchErrorOptions
 * @description `catchError` 和 `catchErrorSync` 函数的配置选项。
 * @template E - 错误对象的类型。
 */
export type CatchErrorOptions<E extends Error = Error> = {
	/**
	 * 自定义日志记录器实例，默认为 `console`。
	 */
	logger?: Logger;
	/**
	 * 配置最终错误的自动日志记录。
	 * - `true`: 使用默认消息记录日志。
	 * - `string`: 使用该字符串作为默认日志消息的前缀。
	 * - `(params: LogOnErrorFormatterParams<E>) => LogOnErrorFormatterResult`:
	 * 一个函数，用于生成自定义日志消息或结构化日志对象。
	 * 返回 `null` 或 `undefined` 以禁止记录此特定错误。
	 * 默认为 `false` (不记录日志)。
	 */
	logOnError?:
		| boolean
		| string
		| ((params: LogOnErrorFormatterParams<E>) => LogOnErrorFormatterResult);
	/**
	 * 自动记录错误时使用的日志级别。
	 * 默认为 `'error'`。
	 */
	logErrorSeverity?: "error" | "warn" | "info" | "debug";
	/**
	 * 重试配置 (仅用于 `catchError` 异步函数)。
	 */
	retry?: {
		/** 最大尝试次数 (包括第一次执行)。默认为 1 (不重试)。 */
		attempts: number;
		/**
		 * 重试之间的延迟时间 (毫秒)。
		 * 可以是一个固定数值，或者是一个函数，该函数接收当前尝试次数和错误对象，返回延迟时间。
		 */
		delay?: number | ((attempt: number, error: E | TimeoutError) => number);
		/**
		 * 一个函数，用于判断是否应该重试当前错误。
		 * 返回 `true` 则重试，`false` 则不重试。
		 * 如果未提供，则只要未达到最大尝试次数就会重试。
		 */
		retryIf?: (error: E | TimeoutError) => boolean;
		/**
		 * 每次重试尝试前调用的回调函数 (在延迟之后，下一次尝试之前)。
		 */
		onProgress?: (progress: {
			attempt: number;
			maxAttempts: number;
			error: E | TimeoutError;
		}) => void;
	};
	/**
	 * 操作的超时时间 (毫秒) (仅用于 `catchError` 异步函数)。
	 * 如果操作在此时间内未完成，则会抛出 `TimeoutError`。
	 */
	timeout?: number;
	/**
	 * 错误回调函数，在每次错误发生时调用。
	 * 可以用于执行自定义的错误处理逻辑，如错误上报、日志记录等。
	 * 注意：此回调函数不应该抛出错误，否则可能影响主要的错误处理流程。
	 */
	onError?: (params: OnErrorCallbackParams<E>) => void;
	/**
	 * 无论操作成功或失败，最后都会执行的回调函数。
	 */
	onFinally?: () => void;
};

// --- 全局配置 ---

let globalCatchErrorOptions: Partial<CatchErrorOptions> = {
	// E 默认为 Error
	logger: console,
	logOnError: false,
	logErrorSeverity: "error",
};

/**
 * @function setDefaultCatchErrorOptions
 * @description 设置全局默认的 `catchError` 选项。
 * @param options - 要设置的默认选项。
 */
export function setDefaultCatchErrorOptions(
	options: Partial<CatchErrorOptions>,
) {
	// E 默认为 Error
	globalCatchErrorOptions = { ...globalCatchErrorOptions, ...options };
}

// --- 辅助函数 ---

/**
 * @function normalizeError
 * @description 将捕获到的各种类型的错误统一转换为标准的 Error 对象。
 * @param errorValue - 捕获到的原始错误，类型为 unknown。
 * @returns 标准的 Error 对象。
 */
export function normalizeError(errorValue: unknown): Error {
	if (errorValue instanceof Error) {
		return errorValue;
	}
	if (typeof errorValue === "string") {
		return new Error(errorValue);
	}
	if (
		typeof errorValue === "object" &&
		errorValue !== null &&
		"message" in errorValue
	) {
		const message = String(
			(errorValue as { message: unknown }).message ||
				"An unknown error occurred",
		);
		const newError = new Error(message);
		if (
			"name" in errorValue &&
			typeof (errorValue as { name: unknown }).name === "string"
		) {
			newError.name = (errorValue as { name: string }).name;
		}
		return newError;
	}
	return new Error("An unknown error occurred");
}

// --- 核心错误处理函数 ---

/**
 * @function catchError
 * @description 捕获 Promise 执行过程中的错误，并提供重试、超时和日志等功能。
 * @template TData - Promise 函数成功时解析的数据类型。
 * @template TResult - 返回结果中 `data` 字段的类型，默认为 `TData`。
 * @template E - 期望捕获的错误类型，默认为 `Error`。
 * @param promiseFn - 一个返回 Promise 的函数，代表要执行的异步操作。
 * @param options - `CatchErrorOptions` 配置选项。
 * @returns `Promise<ErrorResult<TResult, E>>` - 包含数据或错误以及元信息的结果。
 * @example
 * // 基本用法：成功
 * const { data, error, meta } = await catchError(async () => someAsyncOperation());
 * if (data) console.log('Success:', data);
 *
 * @example
 * // 基本用法：失败
 * const { data: data2, error: error2 } = await catchError(async () => {
 * throw new Error("Something went wrong");
 * });
 * if (error2) console.error('Failed:', error2.message, error2.name);
 *
 * @example
 * // 使用重试 (尝试3次，每次延迟100ms)
 * const { error: error3 } = await catchError(async () => flakyAsyncOperation(), {
 * retry: {
 * attempts: 3,
 * delay: 100,
 * onProgress: ({ attempt, maxAttempts }) => console.log(`Retrying ${attempt}/${maxAttempts}...`)
 * },
 * logOnError: true // 最终失败时自动记录日志
 * });
 * if (error3) console.error('Still failed after retries:', error3.message);
 *
 * @example
 * // 使用超时 (500ms)
 * const { error: error4, meta: meta4 } = await catchError(async () => longRunningOperation(), {
 * timeout: 500,
 * logOnError: "Operation timed out:"
 * });
 * if (error4 && meta4.isTimeout) console.error('Timeout occurred:', error4.message);
 *
 * @example
 * // 自定义日志格式
 * const { error: error5 } = await catchError(async () => anotherAsyncOp(), {
 * logOnError: (params) => ({
 * message: `Custom log for ${params.error.name}`,
 * errorCode: (params.error as any).code || 'UNKNOWN', // 假设错误对象可能有 code 属性
 * attempt: params.attempt,
 * meta: params.meta
 * }),
 * logErrorSeverity: 'warn'
 * });
 *
 * @example
 * // 不记录特定错误
 * const { error: error6 } = await catchError(async () => sensitiveOperation(), {
 * logOnError: (params) => {
 * if (params.error.message === 'ignore_this') return null; // 不记录此错误
 * return "An error occurred in sensitive operation";
 * }
 * });
 *
 * @example
 * // 使用 onError 回调处理错误
 * const { error: error7 } = await catchError(async () => apiCall(), {
 * onError: ({ error, meta, isRetrying, isFinalError }) => {
 * // 发送错误到监控系统
 * if (isFinalError) {
 * console.error('Final error occurred:', error.message);
 * // 发送到错误追踪服务
 * // errorTracker.captureException(error, { meta });
 * }
 * if (isRetrying) {
 * console.warn('Retrying after error:', error.message);
 * }
 * },
 * retry: { attempts: 3, delay: 1000 },
 * logOnError: true
 * });
 *
 * @example
 * // 结合错误回调和自定义重试逻辑
 * const { data: data8, error: error8 } = await catchError(async () => unreliableService(), {
 * onError: ({ error, attempt, maxAttempts, isRetrying }) => {
 * // 记录每次错误尝试
 * console.log(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
 * if (error.name === 'NetworkError' && isRetrying) {
 * console.log('Network error detected, will retry...');
 * }
 * },
 * retry: {
 * attempts: 5,
 * delay: (attempt) => attempt * 1000, // 递增延迟
 * retryIf: (error) => error.name === 'NetworkError' // 只对网络错误重试
 * }
 * });
 */
export async function catchError<
	TData,
	TResult = TData,
	E extends Error = Error,
>(
	promiseFn: () => Promise<TData>,
	options?: CatchErrorOptions<E>,
): Promise<ErrorResult<TResult, E>> {
	const mergedOptions = {
		...globalCatchErrorOptions,
		...options,
	} as CatchErrorOptions<E>; // 类型断言仍然需要，因为 E 可能与 global 不同
	const {
		logger,
		logOnError,
		logErrorSeverity,
		retry,
		timeout,
		onError,
		onFinally,
	} = mergedOptions;
	const currentLogger: Logger = logger || console; // Logger 类型是明确的
	const severity: "error" | "warn" | "info" | "debug" =
		logErrorSeverity || "error";

	const meta: ErrorResult<TResult, E>["meta"] = {
		executionTime: 0,
		retryErrors: [],
		isTimeout: false,
	};
	const startTime = Date.now();

	let attempt = 0;
	const maxAttempts = retry?.attempts || 1;

	const handleFinalErrorLogging = (
		err: E | TimeoutError,
		currentMeta: ErrorResult<unknown, E>["meta"],
	) => {
		if (!logOnError || !currentLogger[severity]) {
			// currentLogger[severity] 是类型安全的
			return;
		}
		let logOutput: LogOnErrorFormatterResult;
		if (typeof logOnError === "function") {
			logOutput = logOnError({
				error: err,
				meta: currentMeta,
				attempt,
				maxAttempts,
			});
		} else {
			const prefix =
				typeof logOnError === "string" ? logOnError : "异步操作失败:";
			logOutput = {
				message: `${prefix} ${err.message}`,
				error: err,
				meta: currentMeta,
			};
		}

		if (logOutput === null || logOutput === undefined) return;

		if (typeof logOutput === "string") {
			currentLogger[severity](logOutput, { error: err, meta: currentMeta });
		} else if (typeof logOutput === "object" && logOutput.message) {
			const { message, ...extraData } = logOutput;
			const logArgs = { error: err, meta: currentMeta, ...extraData };
			currentLogger[severity](message, logArgs);
		}
	};

	const handleErrorCallback = (
		err: E | TimeoutError,
		currentMeta: ErrorResult<unknown, E>["meta"],
		isRetrying = false,
		isFinalError = false,
	) => {
		if (!onError) return;

		try {
			onError({
				error: err,
				meta: currentMeta,
				attempt,
				maxAttempts,
				isRetrying,
				isFinalError,
			});
		} catch (callbackErrorValue) {
			console.error(
				"Error in onError callback:",
				normalizeError(callbackErrorValue),
			);
		}
	};

	try {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			attempt++;
			let attemptPromise: Promise<TData> = promiseFn();

			if (timeout && timeout > 0) {
				attemptPromise = Promise.race([
					attemptPromise,
					new Promise<TData>((_, reject) =>
						setTimeout(() => {
							meta.isTimeout = true;
							reject(
								new TimeoutError(`Operation timed out after ${timeout}ms`),
							);
						}, timeout),
					),
				]);
			}

			try {
				const result = await attemptPromise;
				meta.executionTime = Date.now() - startTime;
				if (attempt > 1) meta.retryCount = attempt - 1;
				return { data: result as unknown as TResult, meta };
			} catch (errorValue) {
				// errorValue is unknown here
				const err = normalizeError(errorValue) as E | TimeoutError; // Cast after normalization
				if (meta.retryErrors) meta.retryErrors.push(err);

				if (meta.isTimeout) {
					meta.executionTime = Date.now() - startTime;
					if (attempt > 1 && retry) meta.retryCount = attempt - 1;
					handleErrorCallback(err, meta, false, true);
					handleFinalErrorLogging(err, meta);
					return { error: err, meta };
				}

				if (
					retry &&
					attempt < maxAttempts &&
					(!retry.retryIf || retry.retryIf(err))
				) {
					handleErrorCallback(err, meta, true, false);
					if (retry.onProgress) {
						try {
							retry.onProgress({ attempt, maxAttempts, error: err });
						} catch (onProgressErrorValue) {
							console.error(
								"Error in onProgress callback:",
								normalizeError(onProgressErrorValue),
							);
						}
					}
					if (retry.delay) {
						const delayDuration =
							typeof retry.delay === "function"
								? retry.delay(attempt, err)
								: retry.delay;
						if (delayDuration > 0) {
							await new Promise((resolve) =>
								setTimeout(resolve, delayDuration),
							);
						}
					}
					// 继续下一次尝试
				} else {
					meta.executionTime = Date.now() - startTime;
					if (attempt > 1 && retry) meta.retryCount = attempt - 1;
					handleErrorCallback(err, meta, false, true);
					handleFinalErrorLogging(err, meta);
					return { error: err, meta };
				}
			}
		}
	} catch (unexpectedErrorValue) {
		// unexpectedErrorValue is unknown
		const err = normalizeError(unexpectedErrorValue) as E | TimeoutError;
		meta.executionTime = Date.now() - startTime;
		handleErrorCallback(err, meta, false, true);
		handleFinalErrorLogging(err, meta);
		return { error: err, meta };
	} finally {
		if (onFinally) {
			try {
				onFinally();
			} catch (e) {
				console.error("Error in onFinally callback:", normalizeError(e));
			}
		}
	}
}

/**
 * @function catchErrorSync
 * @description 同步版本的 `catchError`，用于捕获同步函数执行中的错误。
 * @template T - 函数成功时的返回值类型。
 * @template E - 期望捕获的错误类型，默认为 `Error`。
 * @param fn - 要执行的同步函数。
 * @param options - `CatchErrorOptions` 配置选项 (不包括异步相关的 "timeout", "retry", "onProgress")。
 * @returns `ErrorResult<T, E>` - 包含数据或错误以及元信息的结果。
 * @example
 * // 基本用法：成功
 * const { data, error } = catchErrorSync(() => someSyncOperation());
 * if (data) console.log('Success:', data);
 *
 * @example
 * // 基本用法：失败
 * const { error: error2 } = catchErrorSync(() => {
 * throw new Error("Sync failed");
 * });
 * if (error2) console.error('Failed:', error2.message);
 *
 * @example
 * // 自动记录错误日志
 * const { error: error3 } = catchErrorSync(() => riskySyncOperation(), {
 * logOnError: true
 * });
 *
 * @example
 * // 自定义日志消息前缀和级别
 * const { error: error4 } = catchErrorSync(() => anotherSync(), {
 * logOnError: "Critical sync error:",
 * logErrorSeverity: 'warn'
 * });
 *
 * @example
 * // 使用 onFinally 回调
 * let cleanedUp = false;
 * const { data: data5 } = catchErrorSync(() => {
 * console.log("Performing sync task...");
 * return "sync data";
 * }, {
 * onFinally: () => {
 * cleanedUp = true;
 * console.log("Sync cleanup done.");
 * }
 * });
 * console.log("Cleaned up:", cleanedUp);
 *
 * @example
 * // 使用 onError 回调处理同步错误
 * const { data: data6, error: error6 } = catchErrorSync(() => {
 * throw new Error("Database connection failed");
 * }, {
 * onError: ({ error, meta }) => {
 * // 发送错误到监控系统
 * console.error('Sync operation failed:', error.message);
 * // 可以在这里执行错误上报、通知等逻辑
 * // errorReporter.send(error, { context: 'sync_operation', ...meta });
 * },
 * logOnError: true
 * });
 *
 * @example
 * // 结合错误回调和自定义日志
 * const { data: data7 } = catchErrorSync(() => riskyCalculation(), {
 * onError: ({ error, meta }) => {
 * if (error.name === 'ValidationError') {
 * console.warn('Input validation failed:', error.message);
 * } else {
 * console.error('Unexpected error in calculation:', error.message);
 * }
 * },
 * logOnError: (params) => {
 * // 自定义日志格式，但跳过验证错误的详细日志
 * if (params.error.name === 'ValidationError') return null;
 * return `Calculation error: ${params.error.message}`;
 * }
 * });
 */
export function catchErrorSync<T, E extends Error = Error>(
	fn: () => T,
	options?: Omit<CatchErrorOptions<E>, "timeout" | "retry" | "onProgress">,
): ErrorResult<T, E> {
	const mergedOptions = { ...globalCatchErrorOptions, ...options } as Omit<
		CatchErrorOptions<E>,
		"timeout" | "retry" | "onProgress"
	>;
	const { logger, logOnError, logErrorSeverity, onError, onFinally } =
		mergedOptions;
	const currentLogger: Logger = logger || console;
	const severity: "error" | "warn" | "info" | "debug" =
		logErrorSeverity || "error";

	const meta: ErrorResult<T, E>["meta"] = { executionTime: 0 };
	const startTime = Date.now();

	const handleSyncErrorLogging = (
		err: E,
		currentMeta: ErrorResult<unknown, E>["meta"],
	) => {
		if (!logOnError || !currentLogger[severity]) {
			return;
		}
		const formatterParams: LogOnErrorFormatterParams<E> = {
			error: err,
			meta: currentMeta,
		};
		let logOutput: LogOnErrorFormatterResult;

		if (typeof logOnError === "function") {
			logOutput = logOnError(formatterParams);
		} else {
			const prefix =
				typeof logOnError === "string" ? logOnError : "同步操作失败:";
			logOutput = {
				message: `${prefix} ${err.message}`,
				error: err,
				meta: currentMeta,
			};
		}

		if (logOutput === null || logOutput === undefined) return;

		if (typeof logOutput === "string") {
			currentLogger[severity](logOutput, { error: err, meta: currentMeta });
		} else if (typeof logOutput === "object" && logOutput.message) {
			const { message, ...extraData } = logOutput;
			const logArgs = { error: err, meta: currentMeta, ...extraData };
			currentLogger[severity](message, logArgs);
		}
	};

	const handleSyncErrorCallback = (
		err: E,
		currentMeta: ErrorResult<unknown, E>["meta"],
	) => {
		if (!onError) return;

		try {
			onError({
				error: err,
				meta: currentMeta,
				isFinalError: true, // 同步版本中，错误都是最终错误
			});
		} catch (callbackErrorValue) {
			console.error(
				"Error in onError callback (sync):",
				normalizeError(callbackErrorValue),
			);
		}
	};

	try {
		const result = fn();
		meta.executionTime = Date.now() - startTime;
		return { data: result, meta };
	} catch (errorValue) {
		// errorValue is unknown here
		const err = normalizeError(errorValue) as E; // Cast after normalization
		meta.executionTime = Date.now() - startTime;
		handleSyncErrorLogging(err, meta);
		handleSyncErrorCallback(err, meta);
		return { error: err, meta };
	} finally {
		if (onFinally) {
			try {
				onFinally();
			} catch (e) {
				console.error("Error in onFinally (sync) callback:", normalizeError(e));
			}
		}
	}
}
