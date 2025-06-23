import type { useCreateTask, useUpdateTask } from "@/generated/hooks";
import type { NewTask, Task } from "@/server/db/schema";
import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useState } from "react";

interface TaskFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	initialData?: Task; // 用于编辑模式
	createTaskMutation: ReturnType<typeof useCreateTask>;
	updateTaskMutation: ReturnType<typeof useUpdateTask>;
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

export function TaskForm({
	onSuccess,
	onCancel,
	initialData,
	createTaskMutation,
	updateTaskMutation,
}: TaskFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isEdit = !!initialData;

	const form = useForm({
		defaultValues: {
			name: initialData?.name || "",
			done: initialData?.done || false,
		},
		onSubmit: async ({ value }: { value: NewTask }) => {
			setIsSubmitting(true);
			try {
				if (isEdit && initialData) {
					updateTaskMutation.mutate({
						id: initialData.id,
						data: value,
					});
				} else {
					createTaskMutation.mutate(value);
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
				<form.Field name="name">
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

				{/* 完成状态字段（仅编辑时显示） */}
				{isEdit && (
					<form.Field name="done">
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
