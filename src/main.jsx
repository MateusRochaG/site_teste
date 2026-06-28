import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Cozinha from "./Cozinha.jsx";
import "./index.css";

// Roteamento simples: "/cozinha" mostra o painel da cozinha,
// qualquer outro caminho mostra o site normal do cliente.
const Pagina = window.location.pathname.startsWith("/cozinha") ? Cozinha : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Pagina />
  </React.StrictMode>
);
