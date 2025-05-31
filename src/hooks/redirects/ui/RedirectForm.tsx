import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useCreateRedirect } from "../api";
import {
	type RedirectFormData,
	RedirectFormSchema,
	defaultRedirectFormValues,
} from "../types";

interface RedirectFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

// 错误提示组件
function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid && (
				<div className="mt-1 text-red-500 text-sm">
					{field.state.meta.errors.map((err) => err.message).join(", ")}
				</div>
			)}
			{field.state.meta.isValidating && (
				<div className="mt-1 text-gray-400 text-xs">验证中...</div>
			)}
		</>
	);
}

export function RedirectForm({ onSuccess, onCancel }: RedirectFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createRedirectMutation = useCreateRedirect();

	const form = useForm({
		defaultValues: defaultRedirectFormValues,
		onSubmit: async ({ value }: { value: RedirectFormData }) => {
			setIsSubmitting(true);
			try {
				await createRedirectMutation.mutateAsync(value);
				form.reset();
				onSuccess?.();
			} catch (error) {
				console.error("保存失败：", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	return (
		<div className="rounded-lg border border-gray-200 p-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* 原始URL字段 */}
				<form.Field
					name="originalUrl"
					validators={{
						onBlur: RedirectFormSchema.shape.originalUrl,
					}}
				>
					{(field) => (
						<div>
							<label
								htmlFor={field.name}
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								原始链接 *
							</label>
							<input
								id={field.name}
								name={field.name}
								type="url"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="请输入要缩短的链接，如：https://example.com/very-long-url"
								className="w-full border-0 border-gray-200 border-b bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0"
							/>
							<FieldInfo field={field} />
						</div>
					)}
				</form.Field>

				{/* 自定义短码字段 */}
				<form.Field
					name="customCode"
					validators={{
						onBlur: RedirectFormSchema.shape.customCode,
					}}
				>
					{(field) => (
						<div>
							<label
								htmlFor={field.name}
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								自定义短码（可选）
							</label>
							<div className="flex items-center gap-2">
								<span className="text-gray-500 text-sm">
									{window.location.origin}/s/
								</span>
								<input
									id={field.name}
									name={field.name}
									type="text"
									value={field.state.value || ""}
									onChange={(e) =>
										field.handleChange(e.target.value.toUpperCase())
									}
									onBlur={field.handleBlur}
									placeholder="自定义短码（留空自动生成）"
									className="flex-1 border-0 border-gray-200 border-b bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0"
								/>
							</div>
							<FieldInfo field={field} />
							<div className="mt-1 text-gray-400 text-xs">
								可使用大写字母、数字、下划线和横线，长度3-20字符，留空自动生成
							</div>
						</div>
					)}
				</form.Field>

				{/* 表单级别错误 */}
				<form.Subscribe selector={(state) => state.errors}>
					{(errors) =>
						errors.length > 0 && (
							<div className="rounded-md border border-red-200 bg-red-50 p-3">
								<div className="text-red-700 text-sm">
									{errors.map((error, index) => (
										<div key={index}>{String(error)}</div>
									))}
								</div>
							</div>
						)
					}
				</form.Subscribe>

				{/* 提交按钮 */}
				<div className="flex justify-end gap-3 pt-4">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="rounded-full border border-gray-300 px-6 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
						>
							取消
						</button>
					)}
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isFormSubmitting]) => (
							<button
								type="submit"
								disabled={!canSubmit || isSubmitting || isFormSubmitting}
								className="rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
							>
								{isSubmitting || isFormSubmitting ? "创建中..." : "创建短链接"}
							</button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
