import React from 'react';
import '../App.css';

// Interface representing each row of the table.
// Keys are column names, values are strings or numbers.
interface TableRow {
  [key: string]: string | number;
}

// Props expected by the DataTable component.
interface Props {
  data: TableRow[];               // Full dataset to display
  currentPage: number;           // Current active page
  rowsPerPage: number;           // Number of rows to display per page
  setPage: (page: number) => void; // Callback to change the current page
}

/**
 * DataTable Component
 * Renders a paginated HTML table based on the provided data and pagination settings.
 */
const DataTable: React.FC<Props> = ({ data, currentPage, rowsPerPage, setPage }) => {
  // If there's no data, show a fallback message.
  if (!data.length) return <p>No data available</p>;

  // Extract column headers from the first row of data.
  const headers = Object.keys(data[0]);

  // Calculate total number of pages based on data length and rows per page.
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Slice data for current page display.
  const pageData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Determine which page numbers to display in the pagination control.
  const pageNumbers = [];
  if (currentPage > 1) pageNumbers.push(currentPage - 1);
  pageNumbers.push(currentPage);
  if (currentPage < totalPages) pageNumbers.push(currentPage + 1);

  return (
    <>
      {/* Table rendering */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th> {/* Serial number column */}
              {headers.map(h => <th key={h}>{h}</th>)} {/* Dynamic column headers */}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i}>
                {/* Display row index relative to full dataset */}
                <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                {/* Render each cell based on headers */}
                {headers.map(h => <td key={h}>{row[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination">
        {/* Previous page button */}
        <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>

        {/* Page number buttons */}
        <div className="page-numbers">
          {pageNumbers.map(num => (
            <button
              key={num}
              className={num === currentPage ? 'active' : ''}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next page button */}
        <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </>
  );
};

export default DataTable;
