import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";

interface PitchDeckData {
    title: string;
    theme: string;
    slides: {
        title: string;
        content: string;
        notes?: string;
    }[];
}

function GeneratePitchDeck() {
    const { output: data, isPending } = useToolInfo<"generate-pitch-deck">();

    if (isPending) return <div className="p-4 animate-pulse text-center">Generating pitch deck...</div>;
    if (!data) return <div className="p-4 text-red-500">No pitch deck data available.</div>;

    return (
        <div className="flex flex-col gap-4 p-4 font-sans text-sm bg-white dark:bg-gray-950">
            <div className="border-b pb-4 mb-4 dark:border-gray-800">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                    {data.title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    Theme: <span className="uppercase font-semibold">{data.theme}</span>
                </p>
            </div>

            <div className="flex overflow-x-auto gap-4 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                {data.slides?.map((slide, i) => (
                    <div key={i} className="min-w-[280px] w-[280px] bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[200px]">
                        <span className="text-xs text-gray-400 font-mono mb-2">SLIDE {i + 1}</span>
                        <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100 line-clamp-2">{slide.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow overflow-hidden line-clamp-4">
                            {slide.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs text-yellow-800 dark:text-yellow-200">
                <span className="font-bold">✨ AI Suggestion:</span> This deck is optimized for your repository. It converts code structure into narrative milestones.
            </div>
        </div>
    );
}

export default GeneratePitchDeck;

mountWidget(<GeneratePitchDeck />);
