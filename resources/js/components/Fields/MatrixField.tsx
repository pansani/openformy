export function MatrixField() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-input p-2 text-xs font-medium text-left"></th>
            <th className="border border-input p-2 text-xs font-medium">Strongly Disagree</th>
            <th className="border border-input p-2 text-xs font-medium">Disagree</th>
            <th className="border border-input p-2 text-xs font-medium">Neutral</th>
            <th className="border border-input p-2 text-xs font-medium">Agree</th>
            <th className="border border-input p-2 text-xs font-medium">Strongly Agree</th>
          </tr>
        </thead>
        <tbody>
          {['Row 1', 'Row 2', 'Row 3'].map((row, idx) => (
            <tr key={idx}>
              <td className="border border-input p-2 text-sm font-medium">{row}</td>
              {[1, 2, 3, 4, 5].map((col) => (
                <td key={col} className="border border-input p-2 text-center">
                  <input type="radio" disabled className="cursor-pointer" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
