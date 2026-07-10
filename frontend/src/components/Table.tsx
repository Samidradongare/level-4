import React from 'react';

interface TableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export const Table: React.FC<TableProps> = ({ headers, children, containerStyle }) => {
  return (
    <div className="table-container" style={containerStyle}>
      <table className="table-glass" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {headers.map((header, index) => (
              <th
                key={index}
                style={{
                  padding: '16px',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: index === headers.length - 1 ? 'right' : index === 2 ? 'right' : index === 3 ? 'center' : 'left'
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
