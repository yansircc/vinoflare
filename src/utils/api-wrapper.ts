import { catchError } from "./catchError";

/**
 * 通用的 API 包装函数，用于处理错误和响应
 * @param apiCall API 调用函数
 * @param customErrorMessage 默认错误消息
 * @returns 处理后的结果
 */
export async function apiWrapper<T>(
	apiCall: () => Promise<any>,
	customErrorMessage = "操作失败",
): Promise<T> {
	const { data: result, error } = await catchError(apiCall);

	if (error || !result) {
		throw new Error(error?.message || customErrorMessage);
	}

	return result;
}

/**
 * 专门用于处理需要 JSON 解析的 API 调用
 * @param apiCall API 调用函数
 * @param customErrorMessage 默认错误消息
 * @returns JSON 解析后的结果
 */
export async function apiWrapperWithJson<T>(
	apiCall: () => Promise<Response>,
	customErrorMessage = "操作失败",
): Promise<T> {
	const response = await apiWrapper<Response>(apiCall, customErrorMessage);
	return response.json();
}
