import "./App.css";
import NERForm from "./components/NER/NERForm";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    BrowserRouter as Router,
    Route,
    Routes,
} from "react-router-dom";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<NERForm />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
