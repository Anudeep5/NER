import { useState } from "react";
import axios from "axios";
import { Container, Form, Button } from "react-bootstrap";

const NERForm = () => {
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [highlightedText, setHighlightedText] = useState("");
    const [error, setError] = useState("");
    const [resetFileInput, setResetFileInput] = useState(true);
    const APIUrl = "http://3.144.204.155:8000/process";

    const handleTextChange = (e) => {
        setText(e.target.value);
        if (e.target.value.trim() !== "") {
            setFile(null); // Clear file input when text is entered
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        if (e.target.files[0]) {
            setText(""); // Clear text input when file is selected
        }
    };

    const handleClear = () => {
        setText("");
        setFile(null);
        setHighlightedText("");
        setError("");

        setResetFileInput(false);
        setTimeout(() => setResetFileInput(true), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setHighlightedText("");

        const formData = new FormData();
        if (text) {
            formData.append("text", text);
        }
        if (file) {
            formData.append("file", file);
        }

        try {
            const response = await axios.post(APIUrl, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const { text: originalText, entities } = response.data;

            // Generate highlighted text while preserving line breaks and structure
            let highlightedChunks = [];
            let currentIndex = 0;

            entities.forEach((entity) => {
                // Add the text before the current entity
                if (currentIndex < entity.start) {
                    const textBefore = originalText.slice(
                        currentIndex,
                        entity.start
                    );
                    highlightedChunks.push(
                        textBefore
                            .replace(/\n/g, "<br>")
                            .replace(/ /g, "&nbsp;")
                    );
                }

                // Add the highlighted entity
                const highlightedEntity = `<span style="background-color: ${
                    entity.color
                }; padding: 2px; border-radius: 4px;" title="${entity.label}">
                        ${entity.text.replace(/ /g, "&nbsp;")} <b>${
                    entity.label
                }</b>
                    </span>`;
                highlightedChunks.push(highlightedEntity);

                // Update the current index to the end of the entity
                currentIndex = entity.end;
            });

            // Add the remaining text after the last entity
            if (currentIndex < originalText.length) {
                const textAfter = originalText.slice(currentIndex);
                highlightedChunks.push(
                    textAfter.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;")
                );
            }

            // Join all chunks to form the final HTML
            const finalHtml = highlightedChunks.join("");

            setHighlightedText(finalHtml);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "An error occurred");
        }
    };

    const handleEnterKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit(e);
        }
    };

    return (
        <Container className="d-flex flex-column align-items-center">
            <div style={{ width: "100%", maxWidth: "750px" }}>
                <h1 className="text-center mb-4">
                    Medical Data Named Entity Recognition
                </h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Upload File:</Form.Label>
                        {resetFileInput && (
                            <Form.Control
                                type="file"
                                accept=".txt"
                                onChange={handleFileChange}
                                disabled={!!text}
                                onKeyDown={handleEnterKeyPress}
                            />
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Enter Text:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={text}
                            onChange={handleTextChange}
                            placeholder="Type text here..."
                            disabled={!!file}
                            onKeyDown={handleEnterKeyPress}
                        />
                    </Form.Group>
                    <div className="text-center">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!file && !text}
                            className="me-2"
                        >
                            Process
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                    </div>
                </Form>

                {error && (
                    <p className="text-danger text-center mt-3">{error}</p>
                )}
            </div>

            {highlightedText && (
                <div
                    className="mt-5"
                    style={{
                        width: "100%",
                        padding: "20px",
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                        lineHeight: "1.5",
                        // overflowX: "auto", // Allow horizontal scrolling for long text
                    }}
                >
                    <h2 className="text-center">Recognized Text:</h2>
                    <div
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                        style={{ textAlign: "left" }}
                    />
                </div>
            )}
        </Container>
    );
};

export default NERForm;
