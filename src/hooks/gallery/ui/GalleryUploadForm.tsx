import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useUploadGalleryImage } from "../api";
import { type FilePreview, galleryUploadFormSchema } from "../types";

interface GalleryUploadFormProps {
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

export function GalleryUploadForm({
	onSuccess,
	onCancel,
}: GalleryUploadFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
	const uploadMutation = useUploadGalleryImage();

	const form = useForm({
		defaultValues: {
			file: undefined as File | undefined,
			title: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			if (!value.file) {
				return;
			}

			setIsSubmitting(true);
			try {
				await uploadMutation.mutateAsync({
					file: value.file,
					title: value.title,
					description: value.description,
				});
				form.reset();
				setFilePreviews([]);
				onSuccess?.();
			} catch (error) {
				console.error("上传失败：", error);
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const preview = URL.createObjectURL(file);
			setFilePreviews([{ file, preview }]);
			form.setFieldValue("file", file);
		}
	};

	const removeFile = () => {
		setFilePreviews([]);
		form.setFieldValue("file", null as any);
		// 重置文件输入
		const fileInput = document.getElementById("file-input") as HTMLInputElement;
		if (fileInput) {
			fileInput.value = "";
		}
	};

	return (
		<div className="rounded-lg border border-gray-200 p-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* 文件上传区域 */}
				<div>
					<label
						htmlFor="file-input"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						选择图片 *
					</label>

					{filePreviews.length === 0 ? (
						<div className="rounded-lg border-2 border-gray-300 border-dashed p-8 text-center">
							<input
								id="file-input"
								type="file"
								accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
								onChange={handleFileChange}
								className="hidden"
							/>
							<label
								htmlFor="file-input"
								className="cursor-pointer text-gray-500 hover:text-gray-700"
							>
								<div>
									<p>点击选择图片文件</p>
									<p className="mt-1 text-xs">
										支持 JPEG、PNG、GIF、WebP 格式，最大 5MB
									</p>
								</div>
							</label>
						</div>
					) : (
						<div className="space-y-4">
							{filePreviews.map((filePreview, index) => (
								<div
									key={index}
									className="rounded-lg border border-gray-200 p-4"
								>
									<div className="flex items-start gap-4">
										<img
											src={filePreview.preview}
											alt="预览"
											className="h-20 w-20 rounded object-cover"
										/>
										<div className="flex-1">
											<p className="font-medium text-sm">
												{filePreview.file.name}
											</p>
											<p className="text-gray-500 text-xs">
												{(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
											</p>
										</div>
										<button
											type="button"
											onClick={removeFile}
											className="text-red-500 text-sm hover:text-red-700"
										>
											移除
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* 标题字段 */}
				<form.Field
					name="title"
					validators={{
						onBlur: galleryUploadFormSchema.shape.title,
					}}
				>
					{(field) => (
						<div>
							<label
								htmlFor={field.name}
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								标题
							</label>
							<input
								id={field.name}
								name={field.name}
								type="text"
								value={field.state.value || ""}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="为图片添加一个标题"
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
						onBlur: galleryUploadFormSchema.shape.description,
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
								placeholder="为图片添加描述信息"
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
								disabled={
									!canSubmit ||
									isSubmitting ||
									isFormSubmitting ||
									filePreviews.length === 0
								}
								className="rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
							>
								{isSubmitting || isFormSubmitting ? "上传中..." : "上传图片"}
							</button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
