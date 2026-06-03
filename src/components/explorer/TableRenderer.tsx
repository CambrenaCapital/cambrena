interface Props {
  headers: string[];
  rows: any[][];
}

const TableRenderer = ({ headers, rows }: Props) => {
  return (
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-lg border border-[#e5e7eb]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[#f9fafb] border-b border-[#e5e7eb]">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-[#374151] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 text-[#374151] whitespace-nowrap">
                  {cell != null
                    ? (() => {
                        if (typeof cell === 'number' && !isNaN(cell))
                          return cell.toLocaleString(undefined, { maximumFractionDigits: 2 });
                        if (typeof cell === 'string' && /^-?\d+(\.\d+)?$/.test(cell.trim()))
                          return Number(cell).toLocaleString(undefined, { maximumFractionDigits: 2 });
                        return String(cell);
                      })()
                    : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableRenderer;
