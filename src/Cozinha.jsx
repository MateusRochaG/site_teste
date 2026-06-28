import React, { useState, useEffect, useCallback } from "react";
import { ChefHat, Clock, Phone, MapPin, RefreshCw, Lock } from "lucide-react";
import { supabase } from "./supabaseClient";

// ⚠️ Isso é só uma trava simples pra evitar que qualquer visitante distraído
// abra o painel por engano — NÃO é uma senha de verdade (qualquer pessoa que
// veja o código-fonte consegue ler ela). Pra proteger de verdade no futuro,
// o ideal é usar o login (Supabase Auth) com uma conta só da equipe da cozinha.
const PIN_COZINHA = "1234";

const STATUS_INFO = {
  pendente: { label: "Recebido", cor: "#A8201A", bg: "#F6DEDB" },
  preparando: { label: "Preparando", cor: "#C9A227", bg: "#FCEFD1" },
  pronto: { label: "Pronto", cor: "#2F6F5E", bg: "#E3EFE9" },
  entregue: { label: "Entregue", cor: "#7A6F5C", bg: "#EDE4D0" },
};

const PROXIMO_STATUS = {
  pendente: "preparando",
  preparando: "pronto",
  pronto: "entregue",
};

const TIPO_LABEL = { local: "Local", viagem: "Para viagem", entrega: "Entrega" };

function formatPreco(v) {
  return Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function formatHora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function Cozinha() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinDigitado, setPinDigitado] = useState("");
  const [erroPin, setErroPin] = useState("");

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [atualizandoId, setAtualizandoId] = useState(null);

  const buscarPedidos = useCallback(async () => {
    if (!supabase) {
      setErro("Supabase não está configurado (faltam as variáveis de ambiente).");
      setCarregando(false);
      return;
    }
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, itens_pedido(quantidade, preco_unitario, pratos(nome))")
      .order("criado_em", { ascending: true });

    if (error) {
      setErro("Não foi possível carregar os pedidos: " + error.message);
    } else {
      setErro("");
      setPedidos(data || []);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (!autenticado) return;
    buscarPedidos();
    const intervalo = setInterval(buscarPedidos, 5000);
    return () => clearInterval(intervalo);
  }, [autenticado, buscarPedidos]);

  async function avancarStatus(pedido) {
    const novoStatus = PROXIMO_STATUS[pedido.status];
    if (!novoStatus) return;
    setAtualizandoId(pedido.id);
    const { error } = await supabase.from("pedidos").update({ status: novoStatus }).eq("id", pedido.id);
    if (!error) {
      setPedidos((atual) => atual.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p)));
    }
    setAtualizandoId(null);
  }

  function conferirPin(e) {
    e.preventDefault();
    if (pinDigitado === PIN_COZINHA) {
      setAutenticado(true);
      setErroPin("");
    } else {
      setErroPin("PIN incorreto.");
    }
  }

  if (!autenticado) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-5"
        style={{ background: "#1B1714", color: "#F7F1E5" }}
      >
        <form onSubmit={conferirPin} className="w-full max-w-xs text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(201,162,39,0.15)" }}
          >
            <Lock size={24} style={{ color: "#C9A227" }} />
          </div>
          <h1 className="text-lg font-semibold mb-1">Painel da Cozinha</h1>
          <p className="text-sm mb-5" style={{ color: "#D8CDB8" }}>
            Digite o PIN da equipe para continuar.
          </p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pinDigitado}
            onChange={(e) => setPinDigitado(e.target.value)}
            className="w-full text-center text-lg rounded-lg px-3 py-2.5 mb-2"
            style={{ background: "#2A2420", border: "1px solid #4A4038", color: "#F7F1E5" }}
            placeholder="••••"
          />
          {erroPin && (
            <p className="text-xs mb-2" style={{ color: "#E0572B" }}>
              {erroPin}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-full py-2.5 text-sm font-semibold mt-2"
            style={{ background: "#C9A227", color: "#1B1714" }}
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const pedidosFiltrados = pedidos.filter((p) =>
    mostrarFinalizados ? true : p.status !== "entregue"
  );

  return (
    <div className="min-h-screen w-full" style={{ background: "#F7F1E5", color: "#1B1714" }}>
      <header className="sticky top-0 z-10 px-5 py-3 flex items-center justify-between" style={{ background: "#1B1714" }}>
        <div className="flex items-center gap-2" style={{ color: "#F7F1E5" }}>
          <ChefHat size={20} style={{ color: "#C9A227" }} />
          <span className="font-semibold">Painel da Cozinha</span>
        </div>
        <button onClick={buscarPedidos} className="flex items-center gap-1.5 text-xs" style={{ color: "#C9A227" }}>
          <RefreshCw size={14} /> Atualizar
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <label className="flex items-center gap-2 text-sm mb-4" style={{ color: "#7A6F5C" }}>
          <input
            type="checkbox"
            checked={mostrarFinalizados}
            onChange={(e) => setMostrarFinalizados(e.target.checked)}
          />
          Mostrar pedidos já entregues
        </label>

        {erro && (
          <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: "#F6DEDB", color: "#A8201A" }}>
            {erro}
          </div>
        )}

        {carregando ? (
          <p className="text-sm text-center py-10" style={{ color: "#7A6F5C" }}>
            Carregando pedidos...
          </p>
        ) : pedidosFiltrados.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: "#7A6F5C" }}>
            Nenhum pedido por aqui agora.
          </p>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados.map((pedido) => {
              const info = STATUS_INFO[pedido.status] || STATUS_INFO.pendente;
              const proximo = PROXIMO_STATUS[pedido.status];
              return (
                <div
                  key={pedido.id}
                  className="rounded-xl p-4"
                  style={{ background: "#FFFFFF", border: "1px solid #EDE4D0" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">#{pedido.id.slice(0, 8)}</span>
                        <span
                          className="text-xs font-medium rounded-full px-2 py-0.5"
                          style={{ background: info.bg, color: info.cor }}
                        >
                          {info.label}
                        </span>
                        <span
                          className="text-xs font-medium rounded-full px-2 py-0.5"
                          style={{ background: "#EDE4D0", color: "#1B1714" }}
                        >
                          {TIPO_LABEL[pedido.tipo] || pedido.tipo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "#9A8F7B" }}>
                        <Clock size={12} /> {formatHora(pedido.criado_em)}
                      </div>
                    </div>
                    <span className="font-display font-semibold text-sm" style={{ color: "#A8201A" }}>
                      R$ {formatPreco(pedido.total)}
                    </span>
                  </div>

                  <div className="mt-3 text-sm">
                    {(pedido.itens_pedido || []).map((it, i) => (
                      <div key={i} className="flex justify-between py-0.5">
                        <span>
                          {it.quantidade}x {it.pratos?.nome || "Item"}
                        </span>
                        <span style={{ color: "#7A6F5C" }}>R$ {formatPreco(it.quantidade * it.preco_unitario)}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-3 pt-3 text-xs space-y-1"
                    style={{ borderTop: "1px solid #EDE4D0", color: "#5C5346" }}
                  >
                    <div>
                      <strong>{pedido.cliente_nome}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} /> {pedido.cliente_telefone}
                    </div>
                    {pedido.endereco_entrega && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} /> {pedido.endereco_entrega}
                      </div>
                    )}
                  </div>

                  {proximo && (
                    <button
                      onClick={() => avancarStatus(pedido)}
                      disabled={atualizandoId === pedido.id}
                      className="w-full mt-3 rounded-full py-2 text-sm font-semibold"
                      style={{
                        background: "#1B1714",
                        color: "#F7F1E5",
                        opacity: atualizandoId === pedido.id ? 0.6 : 1,
                      }}
                    >
                      Marcar como "{STATUS_INFO[proximo].label}"
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
