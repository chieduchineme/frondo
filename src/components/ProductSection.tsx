import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import DataTable from './DataTable';

// Base URL for API requests
const API_BASE = 'https://odogs.onrender.com';

// ProductSection: Component for displaying and filtering product data
const ProductSection: React.FC = () => {
  // State to hold fetched product data
  const [products, setProducts] = useState<any[]>([]);

  // Search type: determines which field is being searched
  const [searchType, setSearchType] = useState<'category' | 'rating' | 'store' | 'title'>('category');

  // Search input or selected value
  const [searchParam, setSearchParam] = useState('');

  // Dropdown options for Select input, based on search type
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 3; // Number of rows to show per page

  // Fetch all products on initial mount
  useEffect(() => {
    axios.get(`${API_BASE}/product/all`).then(res => setProducts(res.data));
  }, []);

  // Fetch filter options based on selected search type
  useEffect(() => {
    const endpointMap = {
      category: '/values/main_category',
      rating: '/values/average_rating',
      store: '/values/store',
      title: '/values/title',
    };

    axios.get(`${API_BASE}/product${endpointMap[searchType]}`).then(res => {
      const key = Object.keys(res.data)[0];
      const formatted = res.data[key].map((val: string) => ({
        label: val,
        value: val,
      }));
      setOptions(formatted);
    });
  }, [searchType]);

  // Handle search action
  const handleSearch = () => {
    if (!searchParam.trim()) return;

    const endpointMap = {
      category: `/product/category/${searchParam}`,
      rating: `/product/rating/above/${searchParam}`,
      store: `/product/store/${searchParam}`,
      title: `/product/search/${searchParam}`,
    };

    axios.get(`${API_BASE}${endpointMap[searchType]}`).then(res => {
      setProducts(res.data);
      setPage(1); // Reset to first page
    });
  };

  // Get the currently visible rows for pagination
  const currentRows = products.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /**
   * Helper function to render values in a human-readable format.
   * If the value is a JSON-like string, it parses and renders it as a list.
   */
  const renderDetails = (key: string, value: any) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      try {
        if (
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('{') && trimmed.endsWith('}'))
        ) {
          const jsonStr = trimmed.replace(/'/g, '"'); // Replace single quotes with double quotes for valid JSON
          const parsed = JSON.parse(jsonStr);

          // Render array values as bullet points
          if (Array.isArray(parsed)) {
            return (
              <ul>
                {parsed.map((item, index) => (
                  <li key={index}>• {String(item)}</li>
                ))}
              </ul>
            );
          }

          // Render object values as key-value pairs
          else if (typeof parsed === 'object') {
            return (
              <ul>
                {Object.entries(parsed).map(([nestedKey, nestedVal]) => (
                  <li key={nestedKey}>
                    <strong>{nestedKey}</strong>: {String(nestedVal)}
                  </li>
                ))}
              </ul>
            );
          }
        }
      } catch (e) {
        // Fallback: return raw value if JSON parsing fails
        return <span>{value}</span>;
      }
    }

    // Default rendering for non-string or simple types
    return <span>{String(value)}</span>;
  };

  return (
    <div className="section">
      <h2>🔍 Search Product</h2>

      {/* Search controls: dropdown to select type, dynamic input for value */}
      <div className="search-controls">
        {/* Dropdown to select the search type */}
        <select value={searchType} onChange={e => setSearchType(e.target.value as any)}>
          <option value="category">By Category</option>
          <option value="rating">By Rating</option>
          <option value="store">By Store</option>
          <option value="title">By Title</option>
        </select>

        {/* Select input for dynamic search parameter */}
        <Select
          className="select-input"
          options={options}
          onChange={opt => setSearchParam(opt?.value || '')}
          isSearchable
          placeholder={`Select ${searchType}...`}
        />

        {/* Button to trigger search */}
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Render results in a tabular format using DataTable component */}
      <DataTable data={products} currentPage={page} rowsPerPage={rowsPerPage} setPage={setPage} />

      {/* Render results in a readable, structured format */}
      <div className="formatted-rows">
        <h3>📝 Readable Format</h3>
        {currentRows.map((row: any, idx: number) => (
          <div key={idx} className="formatted-entry">
            <strong>({(page - 1) * rowsPerPage + idx + 1}.) Row {idx + 1}</strong>
            <ul>
              {Object.entries(row).map(([key, val]) => (
                <li key={key}>
                  <strong>{key}</strong>: {renderDetails(key, val)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
