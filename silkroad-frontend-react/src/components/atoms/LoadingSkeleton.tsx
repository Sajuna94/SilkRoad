interface LoadingSkeletonProps {
	width: string;
	height: string;
}

export default function LoadingSkeleton({
	width,
	height,
}: LoadingSkeletonProps) {
	return (
		<div
			className="bg-gray-200 animate-pulse rounded"
			style={{ width, height }}
		>
			Loading...
		</div>
	);
}
