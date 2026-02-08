import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface WidgetContext<T> {
    data: T;
}

interface ArchitectureData {
    mermaid_diagram: string;
    explanation: string;
}

export default function ExplainArchitecture({
    data,
}: WidgetContext<ArchitectureData>) {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        if (data?.mermaid_diagram && mermaidRef.current) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
            });

            const renderDiagram = async () => {
                try {
                    const { svg } = await mermaid.render('mermaid-svg', data.mermaid_diagram);
                    if (mermaidRef.current) {
                        mermaidRef.current.innerHTML = svg;
                    }
                    setRenderError(null);
                } catch (error) {
                    console.error("Mermaid render error:", error);
                    setRenderError("Failed to render diagram. Showing code instead.");
                }
            };

            renderDiagram();
        }
    }, [data?.mermaid_diagram]);

    if (!data) return <div className="p-4 text-red-500">No architecture data available.</div>;

    return (
        <div className="flex flex-col gap-4 p-4 font-sans text-sm">
            <h2 className="text-lg font-bold">Architecture Diagram</h2>

            <div className="bg-white border p-4 rounded-md overflow-x-auto dark:bg-gray-900 border-gray-200 dark:border-gray-700 min-h-[200px] flex items-center justify-center">
                {renderError ? (
                    <div className="text-red-500 text-xs">{renderError}</div>
                ) : (
                    <div ref={mermaidRef} className="w-full" />
                )}
            </div>

            {/* Fallback code view or debug view */}
            <details className="text-xs text-gray-400">
                <summary className="cursor-pointer mb-2">View Mermaid Code</summary>
                <pre className="bg-gray-100 p-2 rounded dark:bg-black text-green-600 font-mono whitespace-pre-wrap">
                    {data.mermaid_diagram}
                </pre>
            </details>

            <div className="bg-white p-4 rounded-md shadow-sm dark:bg-gray-800">
                <h3 className="font-semibold mb-2">Architectural Explanation</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {data.explanation}
                </p>
            </div>
        </div>
    );
}
