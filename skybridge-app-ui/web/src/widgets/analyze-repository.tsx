
interface WidgetContext<T> {
    data: T;
}

interface AnalysisData {
    summary: string;
    tech_stack: string[];
    key_features: string[];
    complexity_score: number;
}

export default function AnalyzeRepository({
    data,
}: WidgetContext<AnalysisData>) {
    if (!data) return <div className="p-4 text-red-500">No analysis data available.</div>;

    return (
        <div className="flex flex-col gap-4 p-4 font-sans text-sm">
            <h2 className="text-lg font-bold">Repository Analysis</h2>

            <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300">{data.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md dark:bg-blue-900/20">
                    <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Tech Stack</h3>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                        {data.tech_stack?.map((tech, i) => (
                            <li key={i}>{tech}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-md dark:bg-green-900/20">
                    <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">Key Features</h3>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                        {data.key_features?.map((feature, i) => (
                            <li key={i}>{feature}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-md dark:bg-gray-800 flex items-center justify-between">
                <span className="font-semibold">Complexity Score:</span>
                <span className="text-xl font-bold text-purple-600">{data.complexity_score}/10</span>
            </div>
        </div>
    );
}
