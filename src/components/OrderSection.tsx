import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import DataTable from './DataTable';

const API_BASE = 'https://odogs.onrender.com';

// OrderSection component for interacting with and displaying order-related data
const OrderSection: React.FC = () => {
  // Holds the fetched order data
  const [orders, setOrders] = useState<any[]>([]);

  // Determines which type of search is active
  const [searchType, setSearchType] = useState<'customer' | 'category' | 'priority' | 'highProfit' | 'profitByGender'>('customer');

  // Holds the selected or entered search parameter
  const [searchParam, setSearchParam] = useState('');

  // Dropdown options based on search type
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  // Tracks current page for pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 3; // Number of rows per page

  // Fetch all order data on component mount
  useEffect(() => {
    axios.get(`${API_BASE}/order/all`).then(res => setOrders(res.data));
  }, []);

  // Update dropdown options when search type changes
  useEffect(() => {
    const endpointMap = {
      customer: '/data/values/customer_id',
      category: '/data/values/product_category',
      priority: '/data/values/order_priority',
    };

    // Skip dropdown for special search types
    if (searchType === 'highProfit' || searchType === 'profitByGender') {
      setOptions([]);
    } else {
      // Fetch available values for selected search type
      axios.get(`${API_BASE}/order${endpointMap[searchType]}`).then(res => {
        const key = Object.keys(res.data)[0];
        const formatted = res.data[key].map((val: string) => ({ label: val, value: val }));
        setOptions(formatted);
      });
    }
  }, [searchType]);

  // Handle search based on selected type and parameter
  const handleSearch = () => {
    let endpoint = '';

    // Determine the appropriate endpoint
    if (searchType === 'profitByGender') {
      endpoint = '/order/data/profit-by-gender';
    } else if (searchType === 'highProfit') {
      endpoint = `/order/data/high-profit-products?min_profit=${searchParam}`;
    } else {
      const map = {
        customer: `/order/data/customer/${searchParam}`,
        category: `/order/data/product-category/${searchParam}`,
        priority: `/order/data/order-priority/${searchParam}`,
      };
      endpoint = map[searchType];
    }

    // Fetch filtered order data
    axios.get(`${API_BASE}${endpoint}`).then(res => {
      setOrders(res.data);
      setPage(1); // Reset to first page after search
    });
  };

  // Get current rows to display based on pagination
  const currentRows = orders.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Helper function to render nested or structured data nicely
  const renderDetails = (key: string, value: any) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();

      try {
        // Detect and parse array or object string representations
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          const jsonStr = trimmed.replace(/'/g, '"'); // Replace single quotes with double quotes
          const parsed = JSON.parse(jsonStr);

          // Render array as bullet list
          if (Array.isArray(parsed)) {
            return (
              <ul>
                {parsed.map((item, index) => (
                  <li key={index}>• {String(item)}</li>
                ))}
              </ul>
            );
          }

          // Render object as key-value list
          else if (typeof parsed === 'object') {
            return (
              <ul>
                {Object.entries(parsed).map(([nestedKey, nestedVal]) => (
                  <li key={nestedKey}>• <strong>{nestedKey}</strong>: {String(nestedVal)}</li>
                ))}
              </ul>
            );
          }
        }
      } catch (e) {
        // Fallback if parsing fails
        return <span>{value}</span>;
      }
    }

    // Return plain value if not a string or not JSON-like
    return <span>{String(value)}</span>;
  };

  return (
    <div className="section">
      <h2>📌 Search Orders</h2>

      {/* Search Controls: select input and dynamic parameter input */}
      <div className="search-controls">
        {/* Search type selector */}
        <select value={searchType} onChange={e => setSearchType(e.target.value as any)}>
          <option value="customer">By Customer ID</option>
          <option value="category">By Product Category</option>
          <option value="priority">By Order Priority</option>
          <option value="highProfit">High-Profit Products</option>
          <option value="profitByGender">Profit by Gender</option>
        </select>

        {/* Parameter input - dynamic: text field or dropdown */}
        {(searchType === 'highProfit' || searchType === 'profitByGender') ? (
          <input
            type="text"
            value={searchParam}
            onChange={e => setSearchParam(e.target.value)}
            placeholder="Enter value..."
          />
        ) : (
          <Select
            className="select-input"
            options={options}
            onChange={opt => setSearchParam(opt?.value || '')}
            isSearchable
            placeholder={`Select ${searchType}...`}
          />
        )}

        {/* Trigger search */}
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Render tabular view of orders */}
      <DataTable
        data={orders}
        currentPage={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
      />

      {/* Render formatted (human-readable) view */}
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

export default OrderSection;
