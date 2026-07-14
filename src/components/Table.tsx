interface TableProps {
  data: Record<string, unknown>[];
}

export default function Table({ data }: TableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          {data.length > 0 &&
            Object.keys(data[0]).map((key) => (
              <th key={key}>{key}</th>
            ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {Object.values(row).map((val, j) => (
              <td key={j}>{String(val)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
