import type { TodoSelect } from "@/server/db/types";
import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useCreateTodo, useUpdateTodo } from "../api";
import {
	type TodoFormData,
	defaultTodoFormValues,
	todoFormSchema,
} from "../types";

interface TodoFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	initialData?: TodoSelect; // 用于编辑模式
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

// 优先级选项
const priorityOptions = [
	{ value: "low", label: "低", color: "bg-green-100 text-green-800" },
	{ value: "medium", label: "中", color: "bg-yellow-100 text-yellow-800" },
	{ value: "high", label: "高", color: "bg-red-100 text-red-800" },
] as const;

export function TodoForm({ onSuccess, onCancel, initialData }: TodoFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createTodoMutation = useCreateTodo();
	const updateTodoMutation = useUpdateTodo();

	const isEdit = !!initialData;

	const form = useForm({
		defaultValues: initialData
			? {
					title: initialData.title,
					description: initialData.description || "",
					completed: initialData.completed,
					priority: initialData.priority,
				}
			: defaultTodoFormValues,
		onSubmit: async ({ value }: { value: TodoFormData }) => {
			setIsSubmitting(true);
			try {
				if (isEdit && initialData) {
					await updateTodoMutation.mutateAsync({
						id: initialData.id,
						data: value,
					});
				} else {
					await createTodoMutation.mutateAsync(value);
				}
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
				{/* 标题字段 */}
				<form.Field
					name="title"
					validators={{
						onBlur: todoFormSchema.shape.title,
					}}
				>
					{(field) => (
						<div>
							<label
								htmlFor={field.name}
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								标题 *
							</label>
							<input
								id={field.name}
								name={field.name}
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="请输入待办事项标题"
								className="w-full border-0 border-gray-200 border-b bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0"
							/>
							<FieldInfo field={field} />
						</div>
					)}
				</form.Field>

				{/* 描述字段 */}
				<form.Field
					name="description"
					validators={{
						onBlur: todoFormSchema.shape.description,
					}}
				>
					{(field) => (
						<div>
							<label
								htmlFor={field.name}
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								描述
							</label>
							<textarea
								id={field.name}
								name={field.name}
								value={field.state.value || ""}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="请输入待办事项描述（可选）"
								rows={3}
								className="w-full resize-none border-0 border-gray-200 border-b bg-transparent px-0 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-0"
							/>
							<FieldInfo field={field} />
							<div className="mt-1 text-gray-400 text-xs">
								{(field.state.value || "").length}/500
							</div>
						</div>
					)}
				</form.Field>

				{/* 优先级字段 */}
				<form.Field name="priority">
					{(field) => (
						<div>
							<label
								htmlFor={field.name}
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								优先级
							</label>
							<div className="flex gap-2">
								{priorityOptions.map((option) => (
									<label
										key={option.value}
										className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-all ${
											field.state.value === option.value
												? option.color
												: "bg-gray-100 text-gray-600 hover:bg-gray-200"
										}`}
									>
										<input
											type="radio"
											name={field.name}
											value={option.value}
											checked={field.state.value === option.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value as "low" | "medium" | "high",
												)
											}
											className="sr-only"
										/>
										{option.label}
									</label>
								))}
							</div>
							<FieldInfo field={field} />
						</div>
					)}
				</form.Field>

				{/* 完成状态字段（仅编辑时显示） */}
				{isEdit && (
					<form.Field name="completed">
						{(field) => (
							<div>
								<label className="flex cursor-pointer items-center gap-2">
									<input
										type="checkbox"
										checked={field.state.value}
										onChange={(e) => field.handleChange(e.target.checked)}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="font-medium text-gray-700 text-sm">
										已完成
									</span>
								</label>
								<FieldInfo field={field} />
							</div>
						)}
					</form.Field>
				)}

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
								{isSubmitting || isFormSubmitting
									? isEdit
										? "更新中..."
										: "创建中..."
									: isEdit
										? "更新待办事项"
										: "创建待办事项"}
							</button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
