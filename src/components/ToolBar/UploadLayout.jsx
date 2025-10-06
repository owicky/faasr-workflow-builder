import { useRef } from "react";
import useUndo from "../Utils/Undo";

export function UploadLayout(props) {
    const fileInputRef = useRef(null);
    const { updateLayout } = useUndo();
    
    const shouldBuildGraphRef = useRef(false);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const new_layout = JSON.parse(e.target.result);

                // Clear current states
                updateLayout([...new_layout.nodes],[...new_layout.edges]);
                
                // Set flag before updating state
                shouldBuildGraphRef.current = true;
            } catch (err) {
                console.error("Invalid JSON file", err);
                alert("Failed to load workflow: Invalid JSON");
            }
        };

        reader.readAsText(file);
    };

    const openFileDialog = () => {
        fileInputRef.current.click();
    };


    return (
        <>
            <button onClick={openFileDialog}>Optional: Upload Layout File</button>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </>
    );
}
