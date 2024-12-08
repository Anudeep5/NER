from fastapi import FastAPI, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import spacy

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the spaCy model
nlp = spacy.load("ner_model")


@app.post("/process")
async def process_text(
    text: str = Form(None),
    file: UploadFile = None,
):
    try:
        if text:
            input_text = text
        elif file:
            content = await file.read()
            input_text = content.decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="No text or file provided")

        # Predefined colors for entity labels
        label_colors = {
            "DRUG": "#FFB6C1",
            "STRENGTH": "#ADD8E6",
            "FORM": "#90EE90",
            "DURATION": "#9370DB",
            "DOSAGE": "#FFD700",
            "ROUTE": "#FFA07A",
            "FREQUENCY": "#FFA500",
            "REASON": "#98FB98",
        }

        # Process the input with spaCy
        doc = nlp(input_text)
        entities = [
            {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "color": label_colors.get(ent.label_, "#FFFFFF"),
            }
            for ent in doc.ents
        ]

        return JSONResponse({"text": input_text, "entities": entities})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
