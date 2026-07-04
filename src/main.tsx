import { createRoot } from "react-dom/client";
import { VestDrop } from "./pages/VestDrop";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <>
    <header className="topbar">
      <a className="brand" href="/"><span className="brand-mark">VD</span><span>VestDrop</span></a>
    </header>
    <VestDrop />
  </>,
);
