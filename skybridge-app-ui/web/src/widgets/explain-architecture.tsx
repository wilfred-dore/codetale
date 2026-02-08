
interface WidgetContext<T> {
    data: T;
}

// In a real scenario, we might want to dynamically load mermaid
// But for simplicity/dependency issues in this environment, 
// we will assume the environment might not have mermaid installed.
// However, the user provided a CodeTale API that returns Mermaid strings.
// Let's try to render it simply or just display the code block if rendering is hard.
// For Skybridge widgets, rendering mermaid is often done via a library.
// Since I cannot install new npm packages easily without breaking things, 
// I will render the mermaid code in a <pre> block and instruct the user that 
// in a full environment they should npm install mermaid. 
// BUT wait, I can try to use a CDN or just display it textually. 
// Actually, I can allow the user to see the code clearly.

interface ArchitectureData {
    mermaid_diagram: string;
    explanation: string;
}

export default function ExplainArchitecture({
    data,
}: WidgetContext<ArchitectureData>) {
    if (!data) return <div className="p-4 text-red-500">No architecture data available.</div>;

    return (
        <div className="flex flex-col gap-4 p-4 font-sans text-sm">
            <h2 className="text-lg font-bold">Architecture Diagram</h2>

            <div className="bg-gray-50 border p-4 rounded-md overflow-x-auto dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-2 text-gray-500 uppercase text-xs">Mermaid Diagram Code</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded dark:bg-black text-green-600 font-mono whitespace-pre-wrap">
                    {data.mermaid_diagram}
                </pre>
                <p className="mt-2 text-xs text-gray-400 italic">
                    (Copy this code into a Mermaid live editor or view directly if supported)
                </p>
            </div>

            <div className="bg-white p-4 rounded-md shadow-sm dark:bg-gray-800">
                <h3 className="font-semibold mb-2">Architectural Explanation</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {data.explanation}
                </p>
            </div>
        </div>
    );
}
