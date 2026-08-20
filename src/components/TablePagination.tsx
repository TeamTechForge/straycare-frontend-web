import "./TablePagination.css";

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
}: TablePaginationProps) {
  // Clamp the page number when filtering reduces the available rows.
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const firstItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="table-pagination">
      <span>Showing {firstItem}–{lastItem} of {totalItems}</span>
      <div className="table-pagination-actions">
        <button disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}>
          Previous
        </button>
        <span>Page {safePage} of {totalPages}</span>
        <button disabled={safePage === totalPages} onClick={() => onPageChange(safePage + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
