import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";

interface RepoAnalysis {
    summary: string;
    tech_stack: string[];
    key_features: string[];
    complexity_score: number;
}

interface ComparisonData {
    repo1: { url: string; data: RepoAnalysis };
    repo2: { url: string; data: RepoAnalysis };
}

function CompareRepositories() {
    const { output: data, isPending } = useToolInfo<"compare-repositories">();

    if (isPending) return <div className="p-4 animate-pulse">Comparing repositories...</div>;
    if (!data) return <div className="p-4 text-red-500">No comparison data available.</div>;

    return (
        <div className="flex flex-col gap-4 p-4 font-sans text-sm w-full bg-white dark:bg-gray-950">
            <h2 className="text-xl font-bold text-center mb-4">Repository Comparison</h2>

            <div className="grid grid-cols-2 gap-6 w-full">
                {/* Repo 1 Column */}
                <div className="flex flex-col gap-4 border-r pr-4 dark:border-gray-800">
                    <div className="bg-gray-100 p-3 rounded text-center font-bold break-all dark:bg-gray-800">
                        {data.repo1.url.split('/').slice(-2).join('/')}
                    </div>

                    <div className="bg-blue-50 p-4 rounded dark:bg-blue-900/20">
                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">Summary</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-4">{data.repo1.data.summary}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.repo1.data.tech_stack?.slice(0, 5).map((tech: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs dark:bg-gray-700">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded dark:bg-gray-800/50">
                        <span className="font-semibold text-xs text-gray-500">Complexity</span>
                        <span className="font-bold text-lg text-purple-600">{data.repo1.data.complexity_score}</span>
                    </div>
                </div>

                {/* Repo 2 Column */}
                <div className="flex flex-col gap-4 pl-2">
                    <div className="bg-gray-100 p-3 rounded text-center font-bold break-all dark:bg-gray-800">
                        {data.repo2.url.split('/').slice(-2).join('/')}
                    </div>

                    <div className="bg-blue-50 p-4 rounded dark:bg-blue-900/20">
                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">Summary</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-4">{data.repo2.data.summary}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.repo2.data.tech_stack?.slice(0, 5).map((tech: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs dark:bg-gray-700">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded dark:bg-gray-800/50">
                        <span className="font-semibold text-xs text-gray-500">Complexity</span>
                        <span className="font-bold text-lg text-purple-600">{data.repo2.data.complexity_score}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompareRepositories;

mountWidget(<CompareRepositories />);
