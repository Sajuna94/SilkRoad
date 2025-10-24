interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export default function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
	return (
		<div className="flex gap-2 justify-center mt-4">
			<button
				disabled={currentPage === 1}
				onClick={() => onPageChange(currentPage - 1)}
			>
				←
			</button>
			{pages.map((p) => (
				<button
					key={p}
					className={`px-3 py-1 ${p === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"
						}`}
					onClick={() => onPageChange(p)}
				>
					{p}
				</button>
			))}
			<button
				disabled={currentPage === totalPages}
				onClick={() => onPageChange(currentPage + 1)}
			>
				→
			</button>
		</div>
	);
}
