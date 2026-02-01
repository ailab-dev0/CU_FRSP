import { Link } from 'react-router-dom';

interface BatchRowProps {
  name: string;
  students: number;
  attendance?: number;
  avgScore?: number;
  link: string;
}

interface BatchTableProps {
  title: string;
  batches: BatchRowProps[];
}

export function BatchTable({ title, batches }: BatchTableProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-apple">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {batches.map((batch) => (
          <Link
            key={batch.name}
            to={batch.link}
            className="p-3 rounded-xl bg-apple-lightgray hover:bg-gray-200/70 transition-colors group text-center"
          >
            <p className="font-medium text-gray-900 text-sm truncate">{batch.name}</p>
            {batch.attendance !== undefined && (
              <>
                <p className={`text-2xl font-bold mt-1 ${
                  batch.attendance >= 90
                    ? 'text-green-600'
                    : batch.attendance >= 75
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {Math.round(batch.attendance)}%
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      batch.attendance >= 90
                        ? 'bg-green-500'
                        : batch.attendance >= 75
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${batch.attendance}%` }}
                  />
                </div>
              </>
            )}
            <p className="text-xs text-apple-gray mt-2">{batch.students} students</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
